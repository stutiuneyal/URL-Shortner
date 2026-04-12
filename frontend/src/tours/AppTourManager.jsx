import {Joyride, STATUS, EVENTS } from "react-joyride";
import { useMemo } from "react";
import { useOnboardingStore } from "../store/onboarding.store";
import { getStepsForTour } from "./tourSteps";

export default function AppTourManager() {
    const activeTour = useOnboardingStore((s) => s.activeTour);
    const isRunning = useOnboardingStore((s) => s.isRunning);
    const stopTour = useOnboardingStore((s) => s.stopTour);
    const markTourSeen = useOnboardingStore((s) => s.markTourSeen);

    const steps = useMemo(() => getStepsForTour(activeTour), [activeTour]);

    return (
        <Joyride
            steps={steps}
            run={isRunning && steps.length > 0}
            continuous
            showProgress
            showSkipButton
            scrollToFirstStep
            disableScrolling={false}
            spotlightClicks={false}
            styles={{
                options: {
                    zIndex: 2000,
                    backgroundColor: "#121722",
                    textColor: "#ffffff",
                    primaryColor: "#8b5cf6",
                    arrowColor: "#121722",
                    overlayColor: "rgba(0,0,0,0.65)"
                },
                tooltip: {
                    borderRadius: 18,
                    padding: 16
                },
                buttonNext: {
                    borderRadius: 14,
                    padding: "10px 14px"
                },
                buttonBack: {
                    color: "#cbd5e1"
                },
                buttonSkip: {
                    color: "#94a3b8"
                }
            }}
            locale={{
                back: "Back",
                close: "Close",
                last: "Done",
                next: "Next",
                skip: "Skip"
            }}
            callback={(data) => {
                const { status, type } = data;

                const finished =
                    status === STATUS.FINISHED || status === STATUS.SKIPPED;

                if (finished && activeTour) {
                    markTourSeen(activeTour);
                    stopTour();
                }

                if (type === EVENTS.TOUR_END && activeTour) {
                    markTourSeen(activeTour);
                    stopTour();
                }
            }}
        />
    );
}