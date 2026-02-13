/*
 * @Author: kasuie
 * @Date: 2024-05-26 16:56:52
 * @LastEditors: kasuie
 * @LastEditTime: 2024-10-22 22:03:02
 * @Description:
 */
"use client";
import { BgConfig } from "@/config/config";
import { isClientSide, aSakura, clsx } from "@kasuie/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { variants, showMotion } from "@/lib/motion";
import { Controller } from "../controller/Controller";

export function MainEffect({
  bgArr,
  mbgArr,
  bgStyle,
  blur,
  audio,
  carousel = true,
  carouselGap = 6,
  transitionTime,
  transitionStyle = "default",
  autoAnimate,
  theme,
  motions = {},
}: BgConfig & {
  bgArr: string[];
  mbgArr: string[];
  theme?: string;
  motions?: object;
}) {
  const videoExtensions = [
    ".mp4",
    ".webm",
    ".ogg",
    ".mov",
    ".avi",
    ".flv",
    ".mkv",
  ];

  const [index, setIndex] = useState<number>(0);

  const [mindex, setMindex] = useState<number>(0);

  const [variant, setVariant] = useState<Object>({});

  const videoRef = useRef<HTMLVideoElement>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [aPlaying, setAPlaying] = useState(false);

  const [hasMedia, setHasMedia] = useState(false);

  const [vPlaying, setVPlaying] = useState(false);

  useEffect(() => {
    if (isClientSide && bgStyle && document) {
      if (!document.querySelector("#remio_sakura")) {
        aSakura(bgStyle);
      }
    }
    if (audioRef.current) {
      audioRef.current.play();
      setAPlaying(true);
    }
  });

  useEffect(() => {
    if (audio) {
      setHasMedia(true);
    }
  }, [audio]);

  useEffect(() => {
    if (bgArr && bgArr.length > 1 && carousel) {
      const timer = setInterval(
        () => {
          setIndex((prevIndex) => (prevIndex + 1) % bgArr.length);
        },
        Math.max((carouselGap || 5) * 1000, 3000)
      );
      return () => clearInterval(timer);
    }
  }, [bgArr, carousel]);

  useEffect(() => {
    if (mbgArr && mbgArr.length > 1 && carousel) {
      const timer = setInterval(
        () => {
          setMindex((prevMindex) => (prevMindex + 1) % mbgArr.length);
        },
        Math.max((carouselGap || 5) * 1000, 3000)
      );
      return () => clearInterval(timer);
    }
  }, [mbgArr, carousel]);

  useEffect(() => {
    if (!autoAnimate) {
      transitionStyle
        ? setVariant(variants.default)
        : setVariant(variants[transitionStyle]);
    }
  }, [autoAnimate, transitionStyle]);

  useEffect(() => {
    if (mbgArr?.length) {
      const index = mbgArr.findIndex((v: string) => isVideo(v));
      if (index > -1) {
        setHasMedia(true);
      }
    }
    if (bgArr?.length) {
      const index = bgArr.findIndex((v: string) => isVideo(v));
      if (index > -1) {
        setHasMedia(true);
      }
    }
  }, [mbgArr, bgArr]);

  const isVideo = (url: string) => {
    const lowerCaseUrl = url?.toLowerCase();
    if (!lowerCaseUrl) return false;
    const sourceUrl = lowerCaseUrl.split("?")[0];
    return videoExtensions.some((extension) => sourceUrl.endsWith(extension));
  };

  // 切换播放/暂停状态
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (aPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAPlaying(!aPlaying);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleMuteUnmute = (muted: boolean) => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      }
      videoRef.current.muted = muted;
    }
  };

  const className = clsx(
    "fixed brightness-50 dark:brightness-[.25] h-full w-full top-0 left-0 bg-cover bg-fixed bg-center bg-no-repeat",
    {
      "blur-none": blur == "none",
      "blur-sm": blur == "sm",
      "blur-md": blur == "md",
      "blur-lg": blur == "lg",
    }
  );

  const renderVideo = (
    src: string,
    className: string = "",
    key: number | string
  ) => {
    return (
      <>
        <motion.video
          key={`v:${key}:${src}`}
          ref={videoRef}
          className={clsx(`${className} object-cover`)}
          preload="auto"
          src={src}
          loop
          muted
          autoPlay
          {...variant}
          transition={{
            duration: transitionTime || 0.7,
            ease: "easeInOut",
          }}
        ></motion.video>
      </>
    );
  };

  const renderAudio = (url: string) => {
    return <audio ref={audioRef} src={url} />;
  };

  const renderIframe = (
    src: string,
    className: string = "",
    key: number | string
  ) => {
    return (
      <iframe
        key={key}
        src={`${src}&danmaku=0&autoplay=1&mute=0`}
        className={clsx(`${className} object-cover`)}
        scrolling="no"
        frameBorder="no"
        allowFullScreen
        allow="autoplay; encrypted-media; gyroscope; web-share"
      />
    );
  };

  const renderBg = (url: string, isMbg: boolean, key: number) => {
    const classNames = clsx(className, {
      "md:hidden": isMbg,
      "[@media(max-width:768px)]:hidden": !isMbg,
    });

    if (!url) return null;

    // 检查是否是随机图片路径
    if (url.startsWith('/random/')) {
      // 如果是随机图片路径，添加data-type属性让random.js脚本识别
      return (
        <motion.div
          key={`${key}:${url}`}
          className={clsx(classNames, {
            "animate-[mio-bg-top_6s_linear_reverse_infinite]":
              key % 4 == 0 && autoAnimate,
            "animate-[mio-bg-bottom_6s_linear_reverse_infinite]":
              key % 4 == 1 && autoAnimate,
            "animate-[mio-bg-right_6s_linear_reverse_infinite]":
              key % 4 == 2 && autoAnimate,
            "animate-[mio-bg-left_6s_linear_reverse_infinite]":
              key % 4 == 3 && autoAnimate,
          })}
          data-random-bg={url.split('/')[2]} // 提取类型 (h, v, ys, tx, mia, a)
          {...variant}
          transition={{
            duration: transitionTime || 0.7,
            ease: "easeInOut",
          }}
        ></motion.div>
      );
    }

    if (isVideo(url)) return renderVideo(url, classNames, url);

    return (
      <motion.div
        key={`${key}:${url}`}
        className={clsx(classNames, {
          "animate-[mio-bg-top_6s_linear_reverse_infinite]":
            key % 4 == 0 && autoAnimate,
          "animate-[mio-bg-bottom_6s_linear_reverse_infinite]":
            key % 4 == 1 && autoAnimate,
          "animate-[mio-bg-right_6s_linear_reverse_infinite]":
            key % 4 == 2 && autoAnimate,
          "animate-[mio-bg-left_6s_linear_reverse_infinite]":
            key % 4 == 3 && autoAnimate,
        })}
        style={{
          backgroundImage: `url(${url})`,
        }}
        {...variant}
        transition={{
          duration: transitionTime || 0.7,
          ease: "easeInOut",
        }}
      ></motion.div>
    );
  };

  return (
    <section className="z-0">
      {/* bg-box元素用于支持random.js脚本设置随机背景 */}
      <div 
        id="bg-box" 
        className="fixed brightness-50 dark:brightness-[.25] h-full w-full top-0 left-0 bg-cover bg-fixed bg-center bg-no-repeat"
      />
      <AnimatePresence>
        {/* 如果bgArr中没有随机图片路径，才渲染传统背景图片 */}
        {!bgArr.some(url => url.startsWith('/random/')) && bgArr && renderBg(bgArr[index], false, index)}
        {!mbgArr.some(url => url.startsWith('/random/')) && mbgArr && renderBg(mbgArr[mindex], true, mindex)}
        {audio && renderAudio(audio)}
        {/* {bgArr && bgArr.map((v, i) => renderBg(v, false, i))}
        {mbgArr && mbgArr.map((v, i) => renderBg(v, true, i))} */}
      </AnimatePresence>
      <Controller
        theme={theme}
        hasMedia={hasMedia}
        motions={motions}
        handleMuteUnmute={audio ? togglePlayPause : handleMuteUnmute}
      />
    </section>
  );
}
