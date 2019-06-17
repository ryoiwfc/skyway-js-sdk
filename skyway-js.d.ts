// Type definitions for SkyWay@2.0.0
// Project: https://github.com/skyway/skyway-js-sdk
// Definitions by: Yuji Sugiura <https://github.com/leader22>

/// <reference types="node" />
import { EventEmitter } from "events";

// none | error | warn | full
type LogLevel = 0 | 1 | 2 | 3;
type DataConnectionSerialization = "binary" | "json" | "none";

export interface PeerCredential {
  timestamp: number;
  ttl: number;
  authToken: string;
}

export interface PeerInit {
  key: string;
  debug?: LogLevel;
  turn?: boolean;
  credential?: PeerCredential;
  config?: RTCConfiguration;
  secure?: boolean;
  host?: string;
  port?: number;
}

interface PeerOptions {
  // specified as default(and also overrode)
  debug: LogLevel;
  secure: boolean | undefined;
  confGig: RTCConfiguration;
  turn: boolean;
  dispatcherSecure: boolean;
  dispatcherHost: string;
  dispatcherPort: number;

  // overrode by PeerInit(passed by user)
  key: string;
  credential?: PeerCredential;
  host?: string;
  port?: number;

  // fixed
  token: string;
}

interface ConnectionInit {
  metadata?: any;
  connectionId?: string;
}

export interface MediaConnectionInit extends ConnectionInit {
  videoBandwidth?: number;
  audioBandwidth?: number;
  videoCodec?: string;
  audioCodec?: string;
  videoReceiveEnabled?: boolean;
  audioReceiveEnabled?: boolean;
}

export interface DataConnectionInit extends ConnectionInit {
  serialization?: DataConnectionSerialization;
  dcInit?: RTCDataChannelInit;
}

export interface MediaConnectionAnswerInit {
  videoBandwidth?: number;
  audioBandwidth?: number;
  videoCodec?: string;
  audioCodec?: string;
  videoReceiveEnabled?: boolean;
  audioReceiveEnabled?: boolean;
}

declare class Connection extends EventEmitter {
  open: boolean;
  type: string;
  metadata: any;
  remoteId: string;

  id: string;

  getPeerConnection(): RTCPeerConnection | null;
  close(forceClose?: boolean): void;
}

export declare class MediaConnection extends Connection {
  type: "media";
  localStream: MediaStream;

  answer(stream?: MediaStream, options?: MediaConnectionAnswerInit): void;
  replaceStream(stream: MediaStream): void;

  on(event: "stream", listener: (stream: MediaStream) => void): this;
  on(event: "close", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: string, listener: Function): this;

  once(event: "stream", listener: (stream: MediaStream) => void): this;
  once(event: "close", listener: () => void): this;
  once(event: "error", listener: (err: Error) => void): this;
  once(event: string, listener: Function): this;
}

export declare class DataConnection extends Connection {
  type: "data";
  label: string;
  serialization: DataConnectionSerialization;
  dcInit: RTCDataChannelInit;

  send(data: any): void;

  on(event: "open", listener: () => void): this;
  on(event: "data", listener: (data: any) => void): this;
  on(event: "close", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: string, listener: Function): this;

  once(event: "open", listener: () => void): this;
  once(event: "data", listener: (data: any) => void): this;
  once(event: "close", listener: () => void): this;
  once(event: "error", listener: (err: Error) => void): this;
  once(event: string, listener: Function): this;
}

interface RoomInit {
  mode?: "mesh" | "sfu";
  stream?: MediaStream;
  videoBandwidth?: number;
  audioBandwidth?: number;
  videoCodec?: string;
  audioCodec?: string;
  videoReceiveEnabled?: boolean;
  audioReceiveEnabled?: boolean;
}

export interface RoomData {
  src: string;
  data: any;
}

export interface RoomStream extends MediaStream {
  peerId: string;
}

declare class Room extends EventEmitter {
  name: string;

  getLog(): void;
  close(): void;
  replaceStream(stream: MediaStream): void;
  send(data: any): void;

  on(event: "open", listener: () => void): this;
  on(event: "peerJoin", listener: (peerId: string) => void): this;
  on(event: "peerLeave", listener: (peerId: string) => void): this;
  on(event: "log", listener: (logs: string[]) => void): this;
  on(event: "stream", listener: (stream: RoomStream) => void): this;
  on(event: "data", listener: (data: RoomData) => void): this;
  on(event: "close", listener: () => void): this;
  on(event: string, listener: Function): this;

  once(event: "open", listener: () => void): this;
  once(event: "peerJoin", listener: (peerId: string) => void): this;
  once(event: "peerLeave", listener: (peerId: string) => void): this;
  once(event: "log", listener: (logs: string[]) => void): this;
  once(event: "stream", listener: (stream: RoomStream) => void): this;
  once(event: "data", listener: (data: RoomData) => void): this;
  once(event: "close", listener: () => void): this;
  once(event: string, listener: Function): this;
}

export declare class MeshRoom extends Room {
  connections: {
    [peerId: string]: MediaConnection | DataConnection;
  };
}

export declare class SfuRoom extends Room {
  remoteStreams: {
    [peerId: string]: RoomStream;
  };
  members: string[];
}

declare class Peer extends EventEmitter {
  // props
  connections: {
    [peerId: string]: MediaConnection[] | DataConnection[];
  };
  id: string;
  rooms: {
    [roomName: string]: MeshRoom | SfuRoom;
  };
  options: PeerOptions;

  open: boolean;

  constructor(peerId: string, options: PeerInit);
  constructor(options: PeerInit);

  call(
    peerId: string,
    stream?: MediaStream,
    options?: MediaConnectionInit
  ): MediaConnection;
  connect(peerId: string, options?: DataConnectionInit): DataConnection;
  joinRoom<T extends Room>(roomName: string, options?: RoomInit): T;

  destroy(): void;
  disconnect(): void;
  reconnect(): void;

  listAllPeers(callback: (peers: string[]) => void): void;
  getConnection<T extends Connection>(
    peerId: string,
    connectionId: string
  ): T | null;
  updateCredential(credential: PeerCredential): void;

  on(event: "open", listener: () => void): this;
  on(event: "call", listener: (conn: MediaConnection) => void): this;
  on(event: "close", listener: () => void): this;
  on(event: "connection", listener: (conn: DataConnection) => void): this;
  on(event: "disconnected", listener: (peerId: string) => void): this;
  on(event: "expiresin", listener: (sec: number) => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: string, listener: Function): this;

  once(event: "open", listener: () => void): this;
  once(event: "call", listener: (conn: MediaConnection) => void): this;
  once(event: "close", listener: () => void): this;
  once(event: "connection", listener: (conn: DataConnection) => void): this;
  once(event: "disconnected", listener: (peerId: string) => void): this;
  once(event: "expiresin", listener: (sec: number) => void): this;
  once(event: "error", listener: (err: Error) => void): this;
  once(event: string, listener: Function): this;
}

export default Peer;
