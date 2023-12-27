## govee-effection

[Effection][effection] api for communicating with [Govee][govee] LED devices over UDP.

## Example

This discovers the gove device, turns it on, and then makes it cycle brightness over and over again
to create a strobing effect. Finally, when you hit CTRL-C, the LEDs turn off.

```javascript
import { main, sleep } from "effection";
import { useGoveeDevice } from "govee-effection";

await main(function* () {
  let device = yield* useGoveeDevice();

  yield* device.on();

  try {
    while (true) {
      yield* device.brightness(10);

      yield* sleep(500);

      yield* device.brightness(50);

      yield* sleep(500);

      yield* device.brightness(75);

      yield* sleep(500);

      yield* device.brightness(100);
    }
  } finally {
    yield* device.off();
  }
});
```

[govee]: https://us.govee.com
[effection]: https://frontside.com/effection