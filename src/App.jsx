import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import LiveMeeting from "./components/LiveMeeting";
import MeetingSummary from "./components/MeetingSummary";
import "./App.css";

const Dialog = ({ isOpen, children }) => {
  if (!isOpen) return null;
  return (
    <div className="dialog-overlay">
      <div className="dialog-content">{children}</div>
    </div>
  );
};

const NavBar = ({ onScheduleMeeting }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isNotDashboard = location.pathname !== "/";
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [meetingCode, setMeetingCode] = useState("");
  const [scheduleMeeting, setScheduleMeeting] = useState({
    heading: "",
    date: "",
    time: "",
    code: "",
  });

  const handleJoinMeeting = () => {
    if (meetingCode.trim()) {
      navigate(`/meeting?code=${meetingCode}`);
      setIsJoinDialogOpen(false);
    }
  };

  const handleScheduleMeeting = async () => {
    if (scheduleMeeting.heading && scheduleMeeting.date && scheduleMeeting.time && scheduleMeeting.code) {
      const newMeeting = {
        heading: scheduleMeeting.heading,
        date: scheduleMeeting.date,
        time: scheduleMeeting.time,
        code: scheduleMeeting.code,
      };

      try {
        const response = await fetch("http://localhost:5000/api/schedule/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMeeting),
        });

        const data = await response.json();
        if (response.ok) {
          console.log("✅ Meeting Created:", data);
          onScheduleMeeting(data.meeting);
          setIsScheduleDialogOpen(false);
          setScheduleMeeting({ heading: "", date: "", time: "", code: "" });
        } else {
          console.error("❌ Error:", data.error);
        }
      } catch (error) {
        console.error("❌ Fetch Error:", error);
      }
    } else {
      console.warn("⚠️ Missing Fields:", scheduleMeeting);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">Translatify</div>
      <ul className="nav-links">
        {isNotDashboard ? (
          <li>
            <button className="back-btn" onClick={() => navigate("/")}>
              ← Back to Dashboard
            </button>
          </li>
        ) : (
          <>
            <li>
              <button onClick={() => setIsScheduleDialogOpen(true)}>Schedule Meeting</button>
            </li>
            <li>
              <button onClick={() => setIsJoinDialogOpen(true)}>Join Meeting</button>
            </li>
          </>
        )}
      </ul>

      {/* Join Meeting Dialog */}
      <Dialog isOpen={isJoinDialogOpen}>
        <h2>Join Meeting</h2>
        <p>Enter the meeting code to join.</p>
        <input
          type="text"
          placeholder="Enter meeting code"
          value={meetingCode}
          onChange={(e) => setMeetingCode(e.target.value)}
        />
        <div className="dialog-buttons">
          <button onClick={() => setIsJoinDialogOpen(false)}>Cancel</button>
          <button onClick={handleJoinMeeting}>Join</button>
        </div>
      </Dialog>

      {/* Schedule Meeting Dialog */}
      <Dialog isOpen={isScheduleDialogOpen}>
        <h2>Schedule Meeting</h2>
        <div className="schedule-form">
          <input
            type="text"
            placeholder="Meeting Title"
            value={scheduleMeeting.heading}
            onChange={(e) => setScheduleMeeting({ ...scheduleMeeting, heading: e.target.value })}
          />
          <input
            type="date"
            value={scheduleMeeting.date}
            onChange={(e) => setScheduleMeeting({ ...scheduleMeeting, date: e.target.value })}
          />
          <input
            type="time"
            value={scheduleMeeting.time}
            onChange={(e) => setScheduleMeeting({ ...scheduleMeeting, time: e.target.value })}
          />
          <input
            type="text"
            placeholder="Meeting Code"
            value={scheduleMeeting.code}
            onChange={(e) => setScheduleMeeting({ ...scheduleMeeting, code: e.target.value })}
          />
          <div className="dialog-buttons">
            <button onClick={() => setIsScheduleDialogOpen(false)}>Cancel</button>
            <button onClick={handleScheduleMeeting}>Schedule</button>
          </div>
        </div>
      </Dialog>
    </nav>
  );
};

function App() {
  const [meetings, setMeetings] = useState(() => {
    const savedMeetings = localStorage.getItem("meetings");
    return savedMeetings ? JSON.parse(savedMeetings) : { upcoming: [], past: [] };
  });

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/schedule/all");
        const data = await response.json();

        const now = new Date();
        const upcomingMeetings = data.filter((meeting) => new Date(meeting.date) >= now);
        const pastMeetings = data.filter((meeting) => new Date(meeting.date) < now);

        const updatedMeetings = { upcoming: upcomingMeetings, past: pastMeetings };
        setMeetings(updatedMeetings);
        localStorage.setItem("meetings", JSON.stringify(updatedMeetings));
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, []);

  const addMeeting = (newMeeting) => {
    setMeetings((prevMeetings) => {
      const meetingDate = new Date(newMeeting.date);
      const updatedMeetings = {
        upcoming: meetingDate >= new Date() ? [...prevMeetings.upcoming, newMeeting] : prevMeetings.upcoming,
        past: meetingDate < new Date() ? [...prevMeetings.past, newMeeting] : prevMeetings.past,
      };

      localStorage.setItem("meetings", JSON.stringify(updatedMeetings));
      return updatedMeetings;
    });
  };

  return (
    <Router>
      <div className="app">
        <NavBar onScheduleMeeting={addMeeting} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard upcomingMeetings={meetings.upcoming} pastMeetings={meetings.past} />} />
            <Route path="/meeting" element={<LiveMeeting />} />
            <Route path="/summary/:id" element={<MeetingSummary />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
