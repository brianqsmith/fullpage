# Message passing specification

All protocol names below are case-sensitive literals. This is an as-built specification, not a claim of full schema enforcement. Runtime messages use Firefox structured cloning. The application has no external message listener or remote socket protocol.

## Shared data contracts

`Progress` is the object documented in `04_STORAGE_STATE.md`. A status reply extends it with `busy:boolean`.

`Size` is `{width,height,vw,vh,iw,ih,x,y}` with numeric CSS-pixel dimensions/positions. width/height use maxima of document/body scroll size and document client size; vw/vh are root client dimensions; iw/ih are window inner dimensions; x/y are scrollX/scrollY. The background later applies screenshot scale.

`FrameDescriptor` is `{url:string,sameOrigin:boolean}` where url comes from the frame element's src and sameOrigin is a best-effort contentDocument check. Descriptor lists omit frames under 100 by 60 rendered pixels or display:none; they do not enforce viewport intersection.

## Runtime messages between extension pages and background

Background gate: require `sender.id === browser.runtime.id` and `sender.url` starting with `browser.runtime.getURL('')`. There is no explicit object-shape check, tabId type check, job token check or known-field allowlist. Calls outside the gate receive no handled response. Unknown types fall through. Promise rejections propagate for uncaught begin/settings failures.

| Type and payload | Sender | Receiver | Side effect and response |
| --- | --- | --- | --- |
| `{type:'begin',tabId:number}` | Visible popup; test options context | Background | Await recovery, tabs.get(tabId), start run if no job; respond Progress plus busy. Existing job is reused, regardless of requested tab. Does not await full capture. |
| `{type:'get-progress'}` | Test/developer extension page; supported protocol | Background | Await recovery; respond current Progress plus busy. Production popup receives begin response and broadcasts, not this query. |
| `{type:'stop'}` | Popup stop button | Background | If job exists, set cancelled true; respond true immediately. Restoration happens later in run/finally. |
| `{type:'settings'}` | Supported but unused by current popup/menu handlers | Background | Call runtime.openOptionsPage and return its promise. Actual UI calls this API directly. |
| `{type:'progress',state:Progress}` | Background update | Popup | Render UI, change buttons/classes and schedule or clear close timer. Listener checks only m.type; no sender/schema validation. No response. |

## Runtime commands to content scripts

Envelope: `{type:'fullpage-capture',action:string,...args}`. Background `page` targets frame 0; `allFrames` targets each frame ID returned by injection. `allFrames` uses Promise.all, so one frame's failure fails the operation. Final finish uses Promise.allSettled so cleanup attempts every frame.

Content gate: `sender.id === browser.runtime.id` and matching type. No field/range validation is applied to runtime-command arguments. finish, restore and start are handled before requiring a session. Other actions throw “The page changed. Start a new capture.” without one. Accepted session commands reset the 120-second watchdog. A restored-but-not-finished session returns Size for commands other than ping. Unknown actions with an active session return Size rather than error.

| Action and additional payload | Sender and targets | Side effect | Response |
| --- | --- | --- | --- |
| start; token string | Background to all frames | Restore old session, record original state, connect port, add CSS/watchdog/observer, scroll to origin, expand panels, unstick/anchor | Size |
| frames; no args | Background to all frames | Enumerate substantial frame elements for origin checks | FrameDescriptor array |
| measure; no args | Background to all frames and separately frame 0 | Expand panels, unstick, measure; non-top frame posts dimensions to its parent | Size |
| scroll; x,y,pause numeric and waitImages boolean | Background to frame 0 | Instant scroll; pause; optionally wait images/fonts; two animation frames; unstick | Size |
| settle; pause numeric and waitImages boolean | Background to all frames | Same waits without changing window scroll position | Size |
| prepare; no args | Background to frame 0 | Unstick before determining tile grid | Size |
| hide-fixed; no args | Background to all frames after first tile | Hide remaining/new fixed elements and remember changes | true |
| restore; no args | Background to all frames before encode | Restore layout/scroll once; retain session and port | true even when no session |
| finish; no args | Background to recorded frames in finally | Restore if needed, clear watchdog, set session null, disconnect port | true even when no session |
| ping; no args | Background heartbeat to all frames every 15 s | Refresh watchdog; no page mutation | true |

No application timeout wraps tabs.sendMessage; individual image/font waits are bounded. Navigation, frame removal, inaccessible frame scripts or a stalled response can reject or stall the job. There is no documentId validation. Debugging and future changes must account for these failure modes.

## Long-lived runtime port

Name: `capture-lifetime`. Each content session calls `browser.runtime.connect({name:'capture-lifetime'})`. The top-level background onConnect listener attaches an empty disconnect handler when the name matches. No port data messages are sent. The connection's existence is used to keep the event page alive. The content-side onDisconnect restores the current session; normal finish disconnects it. The background listener does not validate sender or correlate the port to job.token, an audit item rather than a stronger trust guarantee.

## Parent frame dimension messages

Transport: child `parent.postMessage(...,'*')` to the parent page window. Payload:

```json
{"type":"fullpage-frame-size","token":"capture UUID","width":1100,"height":2740}
```

Parent accepts only with an active unrestored session, matching type/token, and an iframe/frame whose contentWindow equals event.source. Width and height must be finite; height must be 1 through 32700; width must be at most 32700 (there is no explicit positive-width check). Parent then applies size eligibility/display checks, expands width/height as needed, releases vertical clipping ancestors and expands panels. There is no reply; the parent is measured in later rounds.

`event.origin` is not checked and targetOrigin is '*'. This permits cross-origin child coordination after injection permission, but page scripts can observe the message/token. No screenshots, text or privileged API results are sent via this channel. Treat dimensions as untrusted input and retain memory bounds. Stronger isolation/validation is recommended before extending this protocol.

## Sequence and compatibility

begin → start → frames → measure rounds → scroll/settle/measure warmup → scroll/prepare → tile scroll/hide-fixed → restore → download wait → finish. Progress broadcasts interleave with that sequence. stop sets a flag; it is not a content command. Changes to command names require updating both background and capture scripts and reloading affected tabs. There is no version negotiation or schema migration for the protocol.
