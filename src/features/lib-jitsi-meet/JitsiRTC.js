import JitsiMeetJS from './';

class JitsiRTC {
  jitsiConfig = {
    hosts: {
      domain: 'voice.smashsuite.com',
      muc: 'conference.voice.smashsuite.com',
    },
    bosh: 'https://voice.smashsuite.com/http-bind',
    // websocket: 'wss://voice2.smashsuite.com/xmpp-websocket',
    clientNode: 'http://jitsi.org/jitsimeet',

    testing: {
      // disableE2EE: false,
      p2pTestMode: false,
    },
    enableNoAudioDetection: true,
    enableNoisyMicDetection: true,
    // startAudioOnly: false,
    // startWithAudioMuted: false,
    resolution: 720,
    constraints: {
      video: {
        height: {
          ideal: 720,
          max: 720,
          min: 240,
        },
      },
    },
    // startVideoMuted: 10,
    // startWithVideoMuted: false,
    // preferH264: true,
    channelLastN: -1,
    openBridgeChannel: true,
    // openBridgeChannel: 'websocket',
    // enableWelcomePage: true,
    enableWelcomePage: false,
    enableUserRolesBasedOnToken: false,

    p2p: {
      enabled: true,
      stunServers: [
        // { urls: 'stun:voice2.smashsuite.com:3478' },
        {urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443'},
      ],
    },
    makeJsonParserHappy: 'even if last key had a trailing comma',
  };

  constructor() {
    console.log('JitsiMeetJS', JitsiMeetJS);

    this.connection = undefined;
    this.room = undefined;

    JitsiMeetJS.init(this.jitsiConfig);

    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.DEBUG);
    // JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.INFO);
    // JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.LOG);
    // JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
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
          JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
          event => this.onConnectionEstablished(event, roomId),
        );
        this.connection.addEventListener(
          JitsiMeetJS.events.connection.CONNECTION_FAILED,
          event => this.onConnectionFailed(event),
        );
        this.connection.addEventListener(
          JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
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

    this.room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, () =>
      this.onConferenceJoined(),
    );
    this.room.on(JitsiMeetJS.events.conference.CONFERENCE_LEFT, () =>
      this.onConferenceLeft(),
    );
    this.room.on(JitsiMeetJS.events.conference.CONNECTION_INTERRUPTED, () =>
      this.onConnectionInterrupted(),
    );
    this.room.on(JitsiMeetJS.events.conference.CONNECTION_RESTORED, () =>
      this.onConnectionRestored(),
    );
    this.room.on(JitsiMeetJS.events.conference.USER_JOINED, userId =>
      this.onUserJoined(userId),
    );
    this.room.on(JitsiMeetJS.events.conference.USER_LEFT, userId =>
      this.onUserLeft(userId),
    );
    this.room.on(
      JitsiMeetJS.events.connectionQuality.LOCAL_STATS_UPDATED,
      stats => this.onLocalStatsUpdated(stats),
    );
    this.room.on(
      JitsiMeetJS.events.connectionQuality.REMOTE_STATS_UPDATED,
      (id, stats) => this.onRemoteStatsUpdated(id, stats),
    );
    this.room.on(
      JitsiMeetJS.events.conference.PARTICIPANT_CONN_STATUS_CHANGED,
      (id, connectionStatus) =>
        this.onParticipantConnectionStatusChanged(id, connectionStatus),
    );
    this.room.on(JitsiMeetJS.events.conference.TRACK_ADDED, track =>
      this.onTrackAdded(track),
    );
    this.room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, track =>
      this.onTrackRemoved(track),
    );
    this.room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track =>
      this.onTrackMuteChanged(track),
    );
    this.room.on(
      JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
      (userId, audioLevel) => this.onTrackAudioLevelChanged(userId, audioLevel),
    );

    this.room.join();
  }

  onConnectionFailed(event) {
    console.log('connection failed', event);
  }

  onConnectionDisconnected() {
    this.connection.removeEventListener(
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      event => this.onConnectionEstablished(event),
    );
    this.connection.removeEventListener(
      JitsiMeetJS.events.connection.CONNECTION_FAILED,
      event => this.onConnectionFailed(event),
    );
    this.connection.removeEventListener(
      JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
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
