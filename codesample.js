import React, { useEffect } from "react";
import "./App.css";
import useBattery from "./hooks/useBattery";
import { useActions } from "./hooks/useActions";
import ChargeButton from "./component/ChargeButton";
import PlugButton from "./component/PlugButton";
import { SettingsTitle, SettingsCard } from "./component/Settings";
import ChargeRemainingTime from "./component/ChargeRemainingTime";
import { BatteryPercentage, BatteryStatus } from "./component/Battery";
import battery from "./img/Battery.svg";
import cableCharging from "./img/CableCharging.svg";
import cableNotCharging from "./img/CableNotCharging.svg";
import boat from "./img/Boat.svg";

function App() {
  const {
    batteryStatus,
    batteryWidth,
    isCharging,
    setIsCharging,
    chargeTarget,
    setChargeTarget,
    maxAcCurr,
    setMaxAcCurr,
    isChargerConnected,
    isChargerPlugLocked,
    setIsChargerPlugLocked,
    timeRemaining,
    rate,
  } = useBattery();

  const {
    increaseMaxAcCurr,
    decreaseMaxAcCurr,
    startCharging,
    stopCharging,
    increaseChargeLimit,
    decreaseChargeLimit,
    togglePlugLock,
  } = useActions(
    maxAcCurr,
    setMaxAcCurr,
    chargeTarget,
    setChargeTarget,
    isChargerPlugLocked,
    setIsCharging,
    setIsChargerPlugLocked
  );

  const SettingsMenu = () => (
    <>
      <div className="sidebarMenu">
        <SettingsTitle />
        <SettingsCard
          titleColor="yellow"
          title="Charge limit:"
          onDecreaseClick={decreaseChargeLimit}
          onIncreaseClick={increaseChargeLimit}
          value={`${chargeTarget} %`}
        />
        <SettingsCard
          titleColor="green"
          title="Charge current:"
          onDecreaseClick={decreaseMaxAcCurr}
          onIncreaseClick={increaseMaxAcCurr}
          value={`${maxAcCurr} A`}
        />
        <div className="bottomContainer">
          <ChargeButton
            isChargerConnected={isChargerConnected}
            isCharging={isCharging}
            onClick={() => {
              isCharging ? stopCharging() : startCharging();
            }}
          />
        </div>
      </div>
    </>
  );

  const BatteryInfo = () => (
    <div className="batteryStatus">
      <BatteryPercentage batteryStatus={batteryStatus} />
      <BatteryStatus
        isCharging={isCharging}
        isChargerConnected={isChargerConnected}
      />
    </div>
  );

  const BatteryDetails = () => (
    <div className="subheading">
      <div className="rate">{isCharging && rate && `${rate}kW`} </div>
      {isCharging && <ChargeRemainingTime remainingTime={timeRemaining} />}
    </div>
  );

  const ChargingCable = () => (
    <div style={{ position: "absolute", top: -3, left: 854 }}>
      {isChargerConnected && isCharging ? (
        <img src={cableCharging} alt="Cable with power" />
      ) : isChargerConnected ? (
        <img src={cableNotCharging} alt="Cable without power" />
      ) : (
        <></>
      )}
    </div>
  );

  const LockButton = () => (
    <div className="lockButton">
      {isChargerConnected && (
        <PlugButton
          isChargerPlugLocked={isChargerPlugLocked}
          onClick={togglePlugLock}
        />
      )}
    </div>
  );

  const Battery = () => (
    <div className="batteryContainer">
      <img src={battery} alt="battery" />
      <div
        style={{ width: `${batteryWidth}px` }}
        className={`chargingProgress ${isCharging ? "charging" : "charged"}`}
      />
    </div>
  );

  const BoatImage = () => (
    <div className="boatImage">
      <img src={boat} alt="boat" />
    </div>
  );

  const BoatWithBatteryVisual = () => (
    <div className="boatContainer">
      <Battery />
      <BoatImage />
    </div>
  );
  return (
    <div className="App">
      <div className="main">
        <div className="mainContent">
          <BatteryInfo />
          <BatteryDetails />
          <ChargingCable />
          <LockButton />
          <BoatWithBatteryVisual />
        </div>
      </div>
      <SettingsMenu />
    </div>
  );
}

export default App;
