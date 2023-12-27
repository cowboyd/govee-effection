import type { Operation } from "effection";
import { call, resource } from "effection";
import type { GoveeDevice, ScanResponse, StatusResponse } from "./types.ts";

export function useGoveeDevice(): Operation<GoveeDevice> {
  return resource(function* (provide) {
    let conn = Deno.listenDatagram({
      transport: "udp",
      hostname: "0.0.0.0",
      port: 4002,
    });

    let membership = yield* call(
      conn.joinMulticastV4("239.255.255.250", "0.0.0.0"),
    );

    let encoder = new TextEncoder();
    yield* call(conn.send(
      encoder.encode(JSON.stringify({
        msg: {
          cmd: "scan",
          data: {
            "account_topic": "reserve",
          },
        },
      })),
      {
        transport: "udp",
        hostname: "239.255.255.250",
        port: 4001,
      },
    ));

    let [bytes] = yield* call(conn.receive());

    let response: ScanResponse = JSON.parse(new TextDecoder().decode(bytes));

    let { ip } = response.msg.data;

    let send = (cmd: string, data: unknown) =>
      call(conn.send(
        encoder.encode(JSON.stringify({
          msg: {
            cmd,
            data,
          },
        })),
        {
          transport: "udp",
          hostname: ip,
          port: 4003,
        },
      ));

    // yield* spawn(() => call(async () => {
    //   for await (let [msg, addr] of conn) {
    // 	console.dir({ msg: JSON.parse(new TextDecoder().decode(msg)), addr });
    //   }
    // }));

    let device: GoveeDevice = {
      *on() {
        yield* send("turn", { value: 1 });
      },
      *off() {
        yield* send("turn", { value: 0 });
      },
      *brightness(value) {
        yield* send("brightness", { value });
      },
      *devStatus() {
        yield* send("devStatus", {});
        let [msg] = yield* call(conn.receive());
        let response: StatusResponse = JSON.parse(
          new TextDecoder().decode(msg),
        );
        return response.msg.data;
      },
    };

    try {
      yield* provide(device);
    } finally {
      yield* call(membership.leave());
      conn.close();
    }
  });
}
