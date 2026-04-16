import Legacy from "next/legacy/image";

// THIRD-PARTY IMPORT
import AudioPlayer from "react-h5-audio-player";

// ASSETS
const play_circle = "/assets/icons/red/play-circle.svg";
const stop_circle = "/assets/icons/red/stop-circle.svg";
const forward = "/assets/icons/forward.svg";
const backward = "/assets/icons/backward.svg";

// TYPES
interface AudioPlayProps {
    audioFile: any;
}

/* ============================== AUDIO PLAYER ============================== */

const AudioPlay = (props: AudioPlayProps) => {
    const { audioFile } = props;
    return (
        <>
            <div className="w-full flex justify-center">
                <AudioPlayer
                    autoPlay
                    src={audioFile}
                    onPlay={(e) => console.log("onPlay")}
                    showSkipControls={false}
                    customVolumeControls={[]}
                    customAdditionalControls={[]}
                    showDownloadProgress={false}
                    layout="horizontal-reverse"
                    progressJumpStep={10000}
                    customIcons={{
                        play: (
                            <div className="relative 3xl:w-[30px] 3xl:h-[30px] w-[20px] h-[20px]">
                                <Legacy src={play_circle} alt="play" layout="fill" />
                            </div>
                        ),
                        pause: (
                            <div className="relative 3xl:w-[30px] 3xl:h-[30px] w-[20px] h-[20px]">
                                <Legacy src={stop_circle} alt="pause" layout="fill" />
                            </div>
                        ),
                        forward: (
                            <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                                <Legacy src={forward} alt="forward" layout="fill" />
                            </div>
                        ),
                        rewind: (
                            <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                                <Legacy src={backward} alt="backward" layout="fill" />
                            </div>
                        ),
                    }}
                />
            </div>
        </>
    );
};

export default AudioPlay;
