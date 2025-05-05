import React from 'react';
import '../styles/MeetingSummary.css';

const MeetingSummary = () => {
  const summary = {
    title: 'Team Sync Meeting',
    date: '2024-03-19',
    duration: '1 hour',
    participants: ['Piyush', 'Sarthak' , 'Shreshtha', 'Shaurya'],
    minutes: [
      'Discussed Project idea',
      'Delegated the work',
      'Everyone was given deadline for their work'
    ],
    tasks: [
      { id: 1, text: 'Figma design', assignee: 'Shreshtha', deadline: '2024-01-31' },
      { id: 2, text: 'Database Creation', assignee: 'Sarthak', deadline: '2024-01-31' }
    ]
  };

  return (
    <div className="meeting-summary">
      <h2>{summary.title}</h2>
      <div className="summary-details">
        <p><strong>Date:</strong> {summary.date}</p>
        <p><strong>Duration:</strong> {summary.duration}</p>
        <p><strong>Participants:</strong> {summary.participants.join(', ')}</p>
      </div>

      <div className="minutes-section">
        <h3>Meeting Minutes</h3>
        <ul>
          {summary.minutes.map((minute, index) => (
            <li key={index}>{minute}</li>
          ))}
        </ul>
      </div>

      <div className="tasks-section">
        <h3>Action Items</h3>
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Assignee</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {summary.tasks.map(task => (
              <tr key={task.id}>
                <td>{task.text}</td>
                <td>{task.assignee}</td>
                <td>{task.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MeetingSummary;