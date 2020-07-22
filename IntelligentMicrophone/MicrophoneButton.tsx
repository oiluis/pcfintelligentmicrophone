import * as React from "react";
import { IconButton, IIconProps, initializeIcons } from 'office-ui-fabric-react';
const MicRecorder = require('mic-recorder-to-mp3');

export interface IMicrophoneButtonProps {
  width: number;
  height: number;
  transcribedText?: string;
  disabled?: boolean;
  transcribedTextChanged?: (newValue: string, confidence: number) => void;
  device?: ComponentFramework.Device;
}

export interface IMicrophoneButtonStage {
  status: string;
  blobURL?: string;
  isBlocked: boolean;
  blobType?: string;
  buffer?: any;
}

const iconStyle = {
  width: '128px',
  height: '128px',
};

initializeIcons();

const recorder = new MicRecorder({
  bitRate: 128
});


export class MicrophoneButton extends React.Component<IMicrophoneButtonProps, IMicrophoneButtonStage> {


  private micIcon: IIconProps = { iconName: 'Microphone', styles: { root: { fontSize: 100 } } };
  private micOffIcon: IIconProps = { iconName: 'MicOff', styles: { root: { fontSize: 100, } } };
  private playIcon: IIconProps = { iconName: 'Play', styles: { root: { fontSize: 100 } } };

  constructor(props: IMicrophoneButtonProps) {
    super(props);
    this.state = {
      status: '',
      blobURL: '',
      isBlocked: false,
    };
  }

  componentDidMount() {
    navigator.getUserMedia({ audio: true },
      () => {
        console.log('Permission Granted');
        this.setState({ isBlocked: false });
      },
      () => {
        console.log('Permission Denied');
        this.setState({ isBlocked: true })
      },
    );
  }

  render() {
    return (
      <div>
        <div>
          <IconButton style={{ display: this.state.status == '' ? 'block' : 'none' }} iconProps={this.micIcon} title="Start Recording" ariaLabel="Emoji" onClick={this.startRecording} />
          <IconButton style={{ display: this.state.status == 'recording' ? 'block' : 'none' }} iconProps={this.micOffIcon} title="Stop Recording" ariaLabel="Emoji" onClick={this.stopRecording} />
          <IconButton style={{ display: this.state.status == 'recorded' ? 'block' : 'none' }} iconProps={this.playIcon} title="Play Recording" ariaLabel="Emoji" onClick={this.playRecording} />

        </div>
        {/*<audio src={this.state.blobURL} controls />*/}
      </div>
    );
  }

  /**
   * Starts the recording process.
   */
  private startRecording = (): void => {
    if (this.state.isBlocked) {
      console.log('Permission Denied');
    } else {
      recorder
        .start()
        .then(() => {
          this.setState({ status: 'recording' });
        }).catch((e: any) => console.error(e));
    }
  }

  /**
   * Stops the current recording and saves the bin file. 
   */
  private stopRecording = (): void => {
    recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]: any) => {
        const blobURL = URL.createObjectURL(blob)
        this.setState({ buffer, status: 'recorded', blobType: blob.type });
      }).catch((e: any) => console.log(e));
  }

  /**
   * Creates the file and plays the audio.
   */
  playRecording = (): void => {
    const file = new File(this.state.buffer, 'me-at-thevoice.mp3', {
      type: this.state.blobType,
      lastModified: Date.now()
    });

    const player = new Audio(URL.createObjectURL(file));
    player.play();
    this.setState({status:''})
  }
}