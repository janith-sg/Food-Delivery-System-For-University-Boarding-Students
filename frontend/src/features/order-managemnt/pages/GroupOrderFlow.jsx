import React, { useState } from "react";
import GroupOrder from "./GroupOrder";
import GroupMenu from "./GroupMenu";
import GroupSummary from "./GroupSummary";

const STEPS = {
  ENTRY: "ENTRY",
  MENU: "MENU",
  SUMMARY: "SUMMARY",
};

const GroupOrderFlow = () => {
  const [step, setStep] = useState(STEPS.ENTRY);
  const [groupCode, setGroupCode] = useState("");
  const [memberName, setMemberName] = useState("");

  const handleEnterGroup = (nextGroupCode, nextMemberName) => {
    setGroupCode(nextGroupCode);
    setMemberName(nextMemberName);
    setStep(STEPS.MENU);
  };

  if (step === STEPS.SUMMARY) {
    return (
      <div className="font-sans min-h-screen">
        <GroupSummary
          groupCode={groupCode}
          memberName={memberName}
          onBack={() => setStep(STEPS.MENU)}
        />
      </div>
    );
  }

  if (step === STEPS.MENU) {
    return (
      <div className="font-sans min-h-screen">
        <GroupMenu
          groupCode={groupCode}
          memberName={memberName}
          onBackToGroups={() => setStep(STEPS.ENTRY)}
          onViewSummary={() => setStep(STEPS.SUMMARY)}
        />
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen">
      <GroupOrder onEnterGroup={handleEnterGroup} onBack={() => window.history.back()} />
    </div>
  );
};

export default GroupOrderFlow;
