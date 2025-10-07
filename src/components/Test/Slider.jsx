import React, { useEffect, useRef } from "react";

// Import particlesCursor from unpkg (you can also npm install if available)
import { particlesCursor } from "https://unpkg.com/threejs-toys@0.0.8/build/threejs-toys.module.cdn.min.js";

const Slider = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const pc = particlesCursor({
      el: containerRef.current,
      gpgpuSize: 512,
      colors: [0x00ff00, 0x0000ff],
      color: 0xff0000,
      coordScale: 0.5,
      noiseIntensity: 0.001,
      noiseTimeCoef: 0.0001,
      pointSize: 5,
      pointDecay: 0.0025,
      sleepRadiusX: 250,
      sleepRadiusY: 250,
      sleepTimeCoefX: 0.001,
      sleepTimeCoefY: 0.002,
    });

    // Click event
    const handleClick = () => {
      pc.uniforms.uColor.value.set(Math.random() * 0xffffff);
      pc.uniforms.uCoordScale.value = 0.001 + Math.random() * 2;
      pc.uniforms.uNoiseIntensity.value = 0.0001 + Math.random() * 0.001;
      pc.uniforms.uPointSize.value = 1 + Math.random() * 10;
    };

    document.body.addEventListener("click", handleClick);

    return () => {
      document.body.removeEventListener("click", handleClick);
      // Cleanup the canvas when component unmounts
      if (pc && pc.dispose) pc.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 10,
          color: "white",
          textAlign: "center",
          top: "40%",
        }}
      >
        <h1 className="text-4xl font-bold">PARTICLES CURSOR</h1>
        <a
          href="https://github.com/klevron/threejs-toys"
          target="_blank"
          rel="noreferrer"
          className="text-white"
        >
        The Three js 
        </a>
      </div>
    </div>
  );
};

export default Slider;
