import { useEffect, useMemo, useState } from "react";
import logo from "/logo.png";
import qrCode from "/qr-code.svg";

interface Result {
  id: string;
  name: string;
  score: number;
}

function QRCode() {
  return (
    <figure className="qr">
      <img src={qrCode} alt="" className="qr-img" />
      <figcaption className="qr-description">Scan to enter the competition</figcaption>
    </figure>
  );
}

function Leaderboard({
  data,
  offset,
}: {
  data: (Result | null)[];
  offset: number;
}) {
  return (
    <table>
      <thead>
        <tr>
          <th className="center pos">Pos</th>
          <th className="left player">Player</th>
          <th className="center points">Points</th>
        </tr>
      </thead>
      <tbody>
        {data.slice(offset, offset + 10).map((result, index) => (
          <tr key={index}>
            <td className="center pos">{index + offset + 1}</td>
            <td className="left player">{result?.name}</td>
            <td className="center points">{result?.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function App() {
  const [results, setResults] = useState<Result[]>([]);
  const [updated, setUpdated] = useState(new Date());

  const paddedResults = useMemo(
    () => results.concat(Array(20).fill(null)).slice(0, 20),
    [results]
  );

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${
          import.meta.env.VITE_SHEET_ID
        }/values/Results?key=${import.meta.env.VITE_API_KEY}`
      );
      const { values } = await response.json();
      setResults(
        (values as [string, string, string][])
          .slice(1)
          .map(([id, name, score]) => ({
            id,
            name,
            score: parseInt(score, 10),
          }))
      );
      setUpdated(new Date());
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="header">
        <QRCode />
        <h1>
          <img src={logo} alt="Dropbox Dev Prix" className="logo" />
        </h1>
        <QRCode />
      </header>
      <main>
        <div className="column">
          <Leaderboard data={paddedResults} offset={0} />
          <p>
            Scoring is based on a total of 600 points, with a focus on both
            correctness and efficiency.
          </p>
          <p>Last updated: {updated.toLocaleString()}</p>
        </div>
        <div className="column">
          <Leaderboard data={paddedResults} offset={10} />
        </div>
      </main>
    </>
  );
}

export default App;
