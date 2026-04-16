"use client";
import { useEffect, useRef, useState } from "react";

// PROJECT IMPORTS
import { Slider, ToolTipIcon } from "../ui-components";
import { downloadFile } from "../helperFunctions";

// ASSETS
const PlayIcon = "/assets/icons/play.svg";
const DownloadIcon = "/assets/icons/download.svg";
const VolumeHighIcon = "/assets/icons/volume-high.svg";
const CloseIcon = "/assets/icons/close.svg";

// TYPES
interface TableAudioPlayerProps {
  className?: string;
  src: string;
  name: string;
}

/* ============================== TABLE AUDIO PLAYER ============================== */

const TableAudioPlayer = (props: TableAudioPlayerProps) => {
  const { className, src, name } = props;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const ref = useRef<any>();
  const [timeStatus, setTimeStatus] = useState<any>(0);
  const [duration, setDuration] = useState<any>(0);
  const [volume, setVolume] = useState<any>(100);
  const [volumeVisible, setVolumeVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!ref?.current) return;
    ref?.current?.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  useEffect(() => {
    if (!ref?.current) return;
    if (isPlaying) {
      ref.current.play();
    } else {
      ref.current.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, ref]);

  useEffect(() => {
    if (!ref?.current) return;
    const v = (parseInt(volume, 10) || 0) / 100;
    ref.current.volume = v;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, ref]);

  // GET TIME IN A FORMAT FROM SECONDS
  const getTime = (seconds: number) => {
    const minutes: any = Math.floor(seconds / 60);
    const extraSeconds: any = seconds % 60;

    return `${parseInt(minutes) > 9
      ? parseInt(minutes)?.toString()
      : "0" + parseInt(minutes)?.toString()
      }:${parseInt(extraSeconds) > 9
        ? parseInt(extraSeconds)?.toString()
        : "0" + parseInt(extraSeconds)?.toString()
      }`;
  };

  // GET PROGRESS BETWEEN 0 TO 100 FOR PROGRESS BAR
  const getProgress = (time: number, total: number) => {
    return Math.floor((time * 100) / total) || 0;
  };

  // PLAY OR PAUSE AUDIO
  const onPlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // SET TIME STATUS FOR PROGRESS BAR & SHOW TIME
  const onTimeUpdate = (e: any) => {
    if (e.target.paused) {
      setIsPlaying(false);
      setTimeStatus(0);
    }
    setTimeStatus(e.target?.currentTime);
  };

  // SET AUDIO DURATION
  const onChange = (e: any) => {
    ref.current.currentTime = e.target.value;
    setTimeStatus(e.target.value);
  };

  return (
    <div>
      <audio
        ref={ref}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={(e: any) => {
          setDuration(e.target?.duration || 0);
        }}
      >
        <source src={src} />
      </audio>
      <div className={`${className} flex gap-4 items-center`}>
        <ToolTipIcon
          src={isPlaying ? CloseIcon : PlayIcon}
          width={18}
          height={18}
          alt="Play"
          onClick={onPlayPause}
        />
        <span>
          {getTime(timeStatus)}/ {getTime(duration)}
        </span>
        <input
          className="h-1 !bg-primary-v10 focus:bg-primary focus:accent-primary focus:outline-none outline-none accent-primary transition-all"
          type="range"
          min={0}
          max={Math.floor(duration)}
          value={timeStatus}
          onMouseUp={onChange}
          onChange={onChange}
        />
        <div className="relative">
          <ToolTipIcon
            src={VolumeHighIcon}
            width={20}
            height={20}
            alt="Volume"
            onClick={() => {
              setVolumeVisible(!volumeVisible);
            }}
          />
          {volumeVisible && (
            <div className={`absolute right-5 top-0`}>
              <Slider
                className="z-50"
                vertical
                value={volume}
                onChange={(e: any) => {
                  setVolume(e.target.value);
                }}
              />
            </div>
          )}
        </div>
        <div className="relative">

          <ToolTipIcon
            src={DownloadIcon}
            width={20}
            height={20}
            alt="Download"
            tooltip="Download"
            onClick={() => {
              downloadFile(src, name);
            }}

          />
        </div>

      </div>
    </div>
  );
};

export default TableAudioPlayer;
