import { useState, useEffect, useEffectEvent } from "react";

export default function MyTimer() {
  const [timerStarted, setTimerStarted] = useState(false);
  const [time, setTime] = useState(0);

  const updatTimeEvent = useEffectEvent(() => {
    console.log("Timer tick");
    setTime(time + 1000);
  });

  useEffect(() => {
    if (!timerStarted) return;

    const timer = window.setInterval(() => {
      updatTimeEvent();
    }, 1000);

    const onMouseMove = () => {
      console.log("Mouse moved");
    };

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      clearInterval(timer);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [timerStarted]);

  function hadlerStartClick() {
    if (!timerStarted) {
      setTimerStarted(true);
    }
  }

  function hadlerStopClick() {
    setTimerStarted(false);
  }

  function hadlerResetClick() {
    setTime(0);
    setTimerStarted(false);
  }

  return (
    <>
      <h3>My Timer Component</h3>
      <button onClick={hadlerStartClick}>Start</button>
      <button onClick={hadlerStopClick}>Stop</button>
      <button onClick={hadlerResetClick}>Reset</button>
      <div>{formatTime(time)}</div>
    </>
  );

  function formatTime(ms: number) {
    // const mseconds = Math.floor(ms / 10) % 100;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    // let msecondsStr = mseconds.toString();
    // if (mseconds < 10) {
    //   msecondsStr = "0" + msecondsStr;
    // }
    return hours + ":" + (minutes % 60) + ":" + (seconds % 60); // + ":" + msecondsStr
  }
}
