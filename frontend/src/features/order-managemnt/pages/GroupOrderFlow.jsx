import React, { useState } from "react";
import GroupOrder from "./GroupOrder";
import GroupMenu from "./GroupMenu";
import GroupSummary from "./GroupSummary";
import "../orderFont.css";

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
      <div className="order-feature-font">
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
      <div className="order-feature-font">
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
    <div className="order-feature-font">
      <GroupOrder onEnterGroup={handleEnterGroup} onBack={() => window.history.back()} />
    </div>
  );
};

export default GroupOrderFlow;
