import React, { useState, useContext, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import Select from "../../components/Select";
import { UserContext } from "../../contexts";
import axios from "axios";

const Trip = ({ history }) => {
  const [user, setUser] = useContext(UserContext);
  const [cards, setCards] = useState([]);
  const [card, setCard] = useState(null);
  const [stations, setStations] = useState([]);
  const [startStation, setStartStation] = useState(null);
  const [endStation, setEndStation] = useState(null);
  const [startTime, setStartTime] = useState(false);

  useEffect(() => {
    loadCards();
    loadStations();
  }, [user, startTime]);

  useEffect(() => {
    if (card) {
      setCard(cards.find((c) => c.BreezecardNum === card.BreezecardNum));
    }
  }, [cards]);

  const loadCards = async () => {
    if (!user) return;
    const { data } = await axios.get("api/passenger/my-cards", {
      params: { user: user.username },
    });
    const { results, err } = data;
    if (results) setCards(results);
  };

  const loadStations = async () => {
    if (!user) return;
    const { data } = await axios.get("api/stations");
    const { results, err } = data;
    if (results) setStations(results);
  };

  if (!user) return <Redirect to="/login" />;

  const startTrip = () => {
    if (+card.Value >= +startStation.EnterFare) {
      setStartTime(new Date());
    } else {
      alert("Insufficient funds");
    }
  };

  const endTrip = async () => {
    await axios.post("/api/passenger/complete-trip", {
      breezecardNum: card.BreezecardNum,
      currentFare: startStation.EnterFare,
      startTime: startTime.toISOString().replace("T", " ").replace(/\..*$/, ""),
      startID: startStation.StopID,
      endID: endStation.StopID,
    });
    setStartTime(null);
  };

  if (!user) return <Redirect to="/login" />;

  return (
    <div className="columns is-centered">
      <div className="column is-one-third">
        <div className="box">
          <header className="title is-1">New Trip</header>

          <form>
            <Select
              label={"Breeze Card"}
              onChange={(e) =>
                setCard(cards.find((c) => c.BreezecardNum === e.target.value))
              }
              value={card?.BreezecardNum}
              options={cards}
              keyFn={(c) => c.BreezecardNum}
              toString={(c) => String(c.BreezecardNum)}
              disabled={!!startTime}
            />

            <p className="has-text-primary is-italic has-text-weight-bold">
              Balance: ${(+card?.Value || 0).toFixed(2)}
            </p>

            <Select
              label={"Start At"}
              onChange={(e) =>
                setStartStation(
                  stations.find((s) => s.StopID === e.target.value)
                )
              }
              value={startStation?.StopID}
              keyFn={(s) => s.StopID}
              options={stations}
              toString={(s) => s.Name}
              disabled={!!startTime}
            />
            {card && !startTime ? (
              <div className="field">
                <div className="control">
                  <button
                    className="button is-danger"
                    type="button"
                    onClick={startTrip}
                  >
                    Start Trip
                  </button>
                </div>
              </div>
            ) : null}

            {startTime ? (
              <section>
                <Select
                  label={"End At"}
                  onChange={(e) =>
                    setEndStation(
                      stations.find((s) => s.StopID === e.target.value)
                    )
                  }
                  value={endStation?.StopID}
                  keyFn={(s) => s.StopID}
                  options={stations}
                  toString={(s) => s.Name}
                  disabled={!startTime}
                />
                <div className="field">
                  <div className="control">
                    <button
                      className="button is-danger"
                      type="button"
                      disabled={!startTime}
                      onClick={endTrip}
                    >
                      End Trip
                    </button>
                  </div>
                </div>
              </section>
            ) : null}

            <div
              className="field is-grouped is-grouped-right"
              style={{ marginTop: "2rem" }}
            ></div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Trip;
