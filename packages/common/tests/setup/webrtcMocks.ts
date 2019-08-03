import { v4 as uuidv4 } from 'uuid'
class MediaStreamMock implements MediaStream {
  _tracks: MediaStreamTrack[] = []
  active: boolean;
  id: string;

  onactive: (this: MediaStream, ev: Event) => any;

  onaddtrack: (this: MediaStream, ev: MediaStreamTrackEvent) => any;

  oninactive: (this: MediaStream, ev: Event) => any;

  onremovetrack: (this: MediaStream, ev: MediaStreamTrackEvent) => any;

  addTrack(track: MediaStreamTrack) {
    this._tracks.push(track)
  }

  clone(): MediaStream {
    throw new Error("Method not implemented.");
  }

  getTrackById(trackId: any): MediaStreamTrack {
    throw new Error("Method not implemented.");
  }

  removeTrack(track: any) {
    throw new Error("Method not implemented.");
  }

  stop() {
    throw new Error("Method not implemented.");
  }

  addEventListener(type: any, listener: any, options?: any) {
    throw new Error("Method not implemented.");
  }

  removeEventListener(type: any, listener: any, options?: any) {
    throw new Error("Method not implemented.");
  }

  dispatchEvent(event: Event): boolean {
    throw new Error("Method not implemented.");
  }

  getTracks() {
    return this._tracks
  }

  getVideoTracks() {
    return this._tracks.filter(t => t.kind === 'video')
  }

  getAudioTracks() {
    return this._tracks.filter(t => t.kind === 'audio')
  }
}

class MediaStreamTrackMock implements MediaStreamTrack {
  enabled: boolean = true;
  id: string = uuidv4();
  isolated: boolean;
  kind: string;
  label: string = 'Track Label';
  muted: boolean;
  readonly: boolean;
  readyState: MediaStreamTrackState;
  remote: boolean;
  onended: (this: MediaStreamTrack, ev: MediaStreamErrorEvent) => any;
  onisolationchange: (this: MediaStreamTrack, ev: Event) => any;
  onmute: (this: MediaStreamTrack, ev: Event) => any;
  onoverconstrained: (this: MediaStreamTrack, ev: MediaStreamErrorEvent) => any;
  onunmute: (this: MediaStreamTrack, ev: Event) => any;

  applyConstraints(constraints: any): Promise<void> {
    throw new Error("Method not implemented.");
  }

  clone(): MediaStreamTrack {
    throw new Error("Method not implemented.");
  }

  getCapabilities(): MediaTrackCapabilities {
    throw new Error("Method not implemented.");
  }

  getConstraints(): MediaTrackConstraints {
    throw new Error("Method not implemented.");
  }

  getSettings(): MediaTrackSettings {
    throw new Error("Method not implemented.");
  }

  stop() {
    this.enabled = false
    this.readyState = 'ended'
  }

  addEventListener(type: any, listener: any, options?: any) {
    // throw new Error("Method not implemented.");
  }

  removeEventListener(type: any, listener: any, options?: any) {
    // throw new Error("Method not implemented.");
  }

  dispatchEvent(event: Event): boolean {
    throw new Error("Method not implemented.");
  }
}

export {
  MediaStreamMock,
  MediaStreamTrackMock
}
