import animationData from "./animation.json";
import Lottie, { LottieProps } from "react-lottie";

const defaultOptions: LottieProps["options"] = {
  loop: true,
  autoplay: true,

  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export function Loading({
  width = 400,
  height = 400,
  options,
}: Partial<LottieProps>) {
  return (
    <Lottie
      options={{ ...defaultOptions, ...options }}
      height={width}
      width={height}
    />
  );
}

export function LoadingPage() {
  return (
    <main className="flex items-center justify-center p-20">
      <Loading />
    </main>
  );
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-[999] flex items-center justify-center bg-white/50 dark:bg-black/50">
      <Loading width={400} height={400} />
    </div>
  );
}
