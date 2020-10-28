import JitsiMeetJS, {
  JitsiConferenceEvents,
  JitsiConnectionQualityEvents,
  JitsiConnectionEvents,
} from './';

class JitsiRTC {
  jitsiConfig = {
    hosts: {
      domain: 'beta.meet.jit.si',
      muc: 'conference.beta.meet.jit.si',
    },
    bosh: 'https://beta.meet.jit.si/http-bind',
  };

  constructor() {
    console.log('JitsiMeetJS', JitsiMeetJS);

    this.connection = undefined;
    this.room = undefined;

    JitsiMeetJS.init(this.jitsiConfig);

    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.DEBUG);
  }

  connect(roomId) {
    navigator.mediaDevices.enumerateDevices().then(sourceInfos => {
      console.log('sourceInfos', sourceInfos);

      navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
        console.log('stream', stream);

        this.connection = new JitsiMeetJS.JitsiConnection(
          null,
          null,
          this.jitsiConfig,
        );

        this.connection.addEventListener(
          JitsiConnectionEvents.CONNECTION_ESTABLISHED,
          event => this.onConnectionEstablished(event, roomId),
        );
        this.connection.addEventListener(
          JitsiConnectionEvents.CONNECTION_FAILED,
          event => this.onConnectionFailed(event),
        );
        this.connection.addEventListener(
          JitsiConnectionEvents.CONNECTION_DISCONNECTED,
          () => this.onConnectionDisconnected(),
        );

        this.connection.connect();
      });
    });
  }

  onConnectionEstablished(event, roomId) {
    console.log('connection established', event);

    const configWithBosh = {
      ...this.jitsiConfig,
      bosh: `${this.jitsiConfig.bosh}?room=${roomId}`,
    };

    this.room = this.connection.initJitsiConference(roomId, configWithBosh);

    this.room.on(JitsiConferenceEvents.CONFERENCE_JOINED, () =>
      this.onConferenceJoined(),
    );
    this.room.on(JitsiConferenceEvents.CONFERENCE_LEFT, () =>
      this.onConferenceLeft(),
    );
    this.room.on(JitsiConferenceEvents.CONNECTION_INTERRUPTED, () =>
      this.onConnectionInterrupted(),
    );
    this.room.on(JitsiConferenceEvents.CONNECTION_RESTORED, () =>
      this.onConnectionRestored(),
    );
    this.room.on(JitsiConferenceEvents.USER_JOINED, userId =>
      this.onUserJoined(userId),
    );
    this.room.on(JitsiConferenceEvents.USER_LEFT, userId =>
      this.onUserLeft(userId),
    );
    this.room.on(JitsiConnectionQualityEvents.LOCAL_STATS_UPDATED, stats =>
      this.onLocalStatsUpdated(stats),
    );
    this.room.on(
      JitsiConnectionQualityEvents.REMOTE_STATS_UPDATED,
      (id, stats) => this.onRemoteStatsUpdated(id, stats),
    );
    this.room.on(
      JitsiConferenceEvents.PARTICIPANT_CONN_STATUS_CHANGED,
      (id, connectionStatus) =>
        this.onParticipantConnectionStatusChanged(id, connectionStatus),
    );
    this.room.on(JitsiConferenceEvents.TRACK_ADDED, track =>
      this.onTrackAdded(track),
    );
    this.room.on(JitsiConferenceEvents.TRACK_REMOVED, track =>
      this.onTrackRemoved(track),
    );
    this.room.on(JitsiConferenceEvents.TRACK_MUTE_CHANGED, track =>
      this.onTrackMuteChanged(track),
    );
    this.room.on(
      JitsiConferenceEvents.TRACK_AUDIO_LEVEL_CHANGED,
      (userId, audioLevel) => this.onTrackAudioLevelChanged(userId, audioLevel),
    );

    this.room.join();
  }

  onConnectionFailed(event) {
    console.log('connection failed', event);
  }

  onConnectionDisconnected() {
    this.connection.removeEventListener(
      JitsiConnectionEvents.CONNECTION_ESTABLISHED,
      event => this.onConnectionEstablished(event),
    );
    this.connection.removeEventListener(
      JitsiConnectionEvents.CONNECTION_FAILED,
      event => this.onConnectionFailed(event),
    );
    this.connection.removeEventListener(
      JitsiConnectionEvents.CONNECTION_DISCONNECTED,
      () => this.onConnectionDisconnected(),
    );
  }

  onConferenceJoined() {
    console.log('conference joined', this.room.myUserId());

    JitsiMeetJS.createLocalTracks({
      devices: ['audio'],
      // micDeviceId: 'audio-1',
      // micDeviceId: 'com.apple.avfoundation.avcapturedevice.built-in_audio:0',
    })
      .then(async localTracks => {
        console.log('local tracks', localTracks);

        for (const localTrack of localTracks) {
          this.room.addTrack(localTrack);
        }
      })
      .catch(error => {
        console.log('createLocalTracks error', error);
      });

    setTimeout(() => {
      this.room.setDisplayName('Thiago teste!!!');
      this.room.sendTextMessage('Mensagem teste!');
    }, 3000);
  }

  onConferenceLeft() {
    console.log('conference left');
  }

  onConnectionInterrupted() {
    console.log('connection interrupted');
  }

  onConnectionRestored() {
    console.log('connection restored');
  }

  onUserJoined(userId) {
    console.log('user joined', userId);
  }

  onUserLeft(userId) {
    console.log('user left', userId);
  }

  onLocalStatsUpdated(stats) {
    console.log('local stats updated', stats);
  }

  onRemoteStatsUpdated(id, stats) {
    console.log('remote stats updated', {
      id,
      stats,
    });
  }

  onParticipantConnectionStatusChanged(id, connectionStatus) {
    console.log('participant connection status changed', {
      id,
      connectionStatus,
    });
  }

  onTrackAdded(track) {
    console.log(`${track.isLocal() ? 'LOCAL' : 'REMOTE'} track added`, track);
  }

  onTrackRemoved(track) {
    console.log('track removed', track);
  }

  onTrackMuteChanged(track) {
    console.log('track mute changed', track);
  }

  onTrackAudioLevelChanged(userId, audioLevel) {
    console.log('track audio level changed', {
      userId,
      audioLevel,
    });
  }
}

export default new JitsiRTC();
