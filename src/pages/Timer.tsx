import { useState } from "react";
import MyTimer from "./../MyTimer.tsx";

export default function TimerPage() {
  const [name, setName] = useState("User");
  return (
    <>
      <h2>Hello, {name}!</h2>
      <button
        onClick={() => {
          setName("New User");
        }}
      >
        Change NameX
      </button>
      <div>
        <>{name !== "New User" ? <MyTimer /> : true}</>
      </div>
    </>
  );
}
