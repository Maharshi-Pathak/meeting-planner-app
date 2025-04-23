import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, CheckSquare, Edit3, AlertCircle, X, Plus, ExternalLink, LogIn, Refresh } from 'lucide-react';
import mockCalendarData from './mockCalendarData.json';

interface ChecklistItem {
  id: number;
  text: string;
  completed: boolean;
}

interface Meeting {
  id: number;
  graphId: string;
  subject: string;
  start: Date;
  end: Date;
  location: string;
  attendees: string[];
  description: string;
  isOrganizer: boolean;
  importance: string;
  isCancelled: boolean;
  onlineMeetingUrl: string | null;
  webLink: string;
  prepNotes: string;
  checklistItems: ChecklistItem[];
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
};

const getTimeRemaining = (meeting: Meeting): string => {
  const now = new Date();
  const start = meeting.start;
  
  if (now > start) {
    return "In progress";
  }
  
  const diffMs = start.getTime() - now.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHrs > 0) {
    return `${diffHrs}h ${diffMins}m`;
  }
  return `${diffMins}m`;
};

/**
 * Format meetings from the Graph API response for the Meeting Prep app
 */
const formatMeetingsForApp = (graphEvents: any): Meeting[] => {
  if (!graphEvents || !graphEvents.value || graphEvents.value.length === 0) {
    return [];
  }

  return graphEvents.value.map((event: any, index: number) => {
    // Get meeting location
    const location = event.location?.displayName || "No location";

    // Format attendees
    const attendees = event.attendees
      .map((attendee: any) => attendee.emailAddress.name)
      .filter((name: string) => 
        // Filter out resource rooms and empty names
        name && !name.includes("Room") && !name.includes("resource.calendar")
      );

    // Create default checklist items
    const checklistItems: ChecklistItem[] = [
      { id: 1, text: "Review meeting agenda", completed: false },
      { id: 2, text: "Prepare discussion points", completed: false }
    ];

    // Add more checklist items based on meeting type
    if (event.subject.toLowerCase().includes("presentation")) {
      checklistItems.push({ id: 3, text: "Review presentation slides", completed: false });
    }
    
    if (event.isOnlineMeeting || event.onlineMeetingUrl || event.onlineMeeting?.joinUrl) {
      checklistItems.push({ id: 4, text: "Test meeting link before joining", completed: false });
    }

    // Get online meeting URL
    let meetingUrl: string | null = null;
    if (event.onlineMeeting?.joinUrl) {
      meetingUrl = event.onlineMeeting.joinUrl;
    } else if (event.onlineMeetingUrl) {
      meetingUrl = event.onlineMeetingUrl;
    } else if (location.includes("https://")) {
      meetingUrl = location;
    }

    return {
      id: index + 1,
      graphId: event.id,
      subject: event.subject,
      start: new Date(event.start.dateTime),
      end: new Date(event.end.dateTime),
      location: location,
      attendees: attendees,
      description: event.bodyPreview,
      isOrganizer: event.isOrganizer,
      importance: event.importance,
      isCancelled: event.isCancelled,
      onlineMeetingUrl: meetingUrl,
      webLink: event.webLink,
      prepNotes: "", // Custom field for meeting prep
      checklistItems: checklistItems,
    };
  });
};

const MeetingPrepApp: React.FC = () => {
  // State
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Handle connection to Outlook
  const handleConnect = async (): Promise<void> => {
    setIsConnecting(true);
    setErrorMessage(null);
    
    try {
      // Simulate connecting to Outlook
      setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);
        // Fetch meetings after connecting
        fetchMeetings();
      }, 1500);
    } catch (error) {
      console.error("Connection error:", error);
      setErrorMessage("Failed to connect to Outlook. Please try again.");
      setIsConnecting(false);
    }
  };
  
  // Fetch meetings from mock data
  const fetchMeetings = async (): Promise<void> => {
    setIsLoadingMeetings(true);
    setErrorMessage(null);
    
    try {
      // Format meetings from the API response
      const formattedMeetings = formatMeetingsForApp(mockCalendarData);
      
      if (formattedMeetings.length > 0) {
        setMeetings(formattedMeetings);
        // Select the first meeting by default
        setSelectedMeeting(formattedMeetings[0]);
      } else {
        setErrorMessage("No meetings found in your calendar.");
      }

      setIsLoadingMeetings(false);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      setErrorMessage("Failed to fetch meetings. Please try again.");
      setIsLoadingMeetings(false);
    }
  };
  
  // Meeting preparation handlers
  const handlePrepNotesChange = (meetingId: number, notes: string): void => {
    setMeetings(meetings.map(meeting => 
      meeting.id === meetingId ? {...meeting, prepNotes: notes} : meeting
    ));

    if (selectedMeeting && selectedMeeting.id === meetingId) {
      setSelectedMeeting({
        ...selectedMeeting,
        prepNotes: notes
      });
    }
  };
  
  const toggleChecklistItem = (meetingId: number, itemId: number): void => {
    setMeetings(meetings.map(meeting => {
      if (meeting.id === meetingId) {
        const updatedChecklist = meeting.checklistItems.map(item => 
          item.id === itemId ? {...item, completed: !item.completed} : item
        );
        return {...meeting, checklistItems: updatedChecklist};
      }
      return meeting;
    }));

    if (selectedMeeting && selectedMeeting.id === meetingId) {
      const updatedChecklist = selectedMeeting.checklistItems.map(item => 
        item.id === itemId ? {...item, completed: !item.completed} : item
      );
      setSelectedMeeting({
        ...selectedMeeting,
        checklistItems: updatedChecklist
      });
    }
  };
  
  const addChecklistItem = (meetingId: number): void => {
    if (!newChecklistItem.trim()) return;
    
    const newItem: ChecklistItem = {
      id: selectedMeeting 
        ? Math.max(0, ...selectedMeeting.checklistItems.map(item => item.id)) + 1 
        : 1,
      text: newChecklistItem,
      completed: false
    };
    
    setMeetings(meetings.map(meeting => {
      if (meeting.id === meetingId) {
        return {
          ...meeting, 
          checklistItems: [...meeting.checklistItems, newItem]
        };
      }
      return meeting;
    }));

    if (selectedMeeting && selectedMeeting.id === meetingId) {
      setSelectedMeeting({
        ...selectedMeeting,
        checklistItems: [...selectedMeeting.checklistItems, newItem]
      });
    }
    
    setNewChecklistItem("");
  };
  
  const removeChecklistItem = (meetingId: number, itemId: number): void => {
    setMeetings(meetings.map(meeting => {
      if (meeting.id === meetingId) {
        const updatedChecklist = meeting.checklistItems.filter(item => item.id !== itemId);
        return {...meeting, checklistItems: updatedChecklist};
      }
      return meeting;
    }));

    if (selectedMeeting && selectedMeeting.id === meetingId) {
      setSelectedMeeting({
        ...selectedMeeting,
        checklistItems: selectedMeeting.checklistItems.filter(item => item.id !== itemId)
      });
    }
  };
  
  // Join meeting function
  const joinMeeting = (meeting: Meeting): void => {
    if (meeting.onlineMeetingUrl) {
      // Open meeting URL in a new tab
      window.open(meeting.onlineMeetingUrl, '_blank');
    } else if (meeting.webLink) {
      // Open Outlook web link
      window.open(meeting.webLink, '_blank');
    } else {
      alert("No online meeting link available");
    }
  };
  
  // Sort meetings by start time
  const sortedMeetings = [...meetings].sort((a, b) => a.start.getTime() - b.start.getTime());
  
  // Authentication screen
  if (!isConnected) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <header className="bg-blue-600 text-white py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Meeting Preparation Assistant</h1>
            </div>
            <div className="flex items-center">
              <div className="text-sm mr-4">
                <p>{formatDate(currentTime)}</p>
              </div>
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium"
              >
                <LogIn className="h-4 w-4 mr-1" />
                {isConnecting ? "Connecting..." : "Connect Outlook"}
              </button>
            </div>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-md text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-semibold mb-2">Connect Your Outlook Calendar</h2>
            <p className="text-gray-600 mb-6">
              To see your actual meetings and prepare for them, you need to connect your Microsoft Outlook calendar.
            </p>
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-blue-600 text-white py-2 px-4 rounded font-medium flex items-center justify-center mx-auto"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Connect with Microsoft
                </>
              )}
            </button>
            {errorMessage && (
              <p className="mt-4 text-red-500">{errorMessage}</p>
            )}
            <p className="mt-4 text-sm text-gray-500">
              This will connect to your Outlook calendar data.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Main application interface (shown after authentication)
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Meeting Preparation Assistant</h1>
          </div>
          <div className="flex items-center">
            <div className="text-sm mr-4">
              <p>{formatDate(currentTime)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={fetchMeetings}
                disabled={isLoadingMeetings}
                className="flex items-center bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium"
              >
                <Refresh className={`h-4 w-4 mr-1 ${isLoadingMeetings ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="text-sm bg-green-500 px-2 py-1 rounded flex items-center">
                <span className="h-2 w-2 bg-white rounded-full mr-2"></span>
                Outlook Connected
              </div>
              <button 
                onClick={() => setIsConnected(false)}
                className="ml-2 flex items-center bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium"
              >
                <LogIn className="h-4 w-4 mr-1 transform rotate-180" />
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {errorMessage && (
        <div className="bg-red-100 text-red-700 px-4 py-2 text-sm">
          {errorMessage}
          <button 
            className="ml-2 underline" 
            onClick={() => setErrorMessage(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Meeting Timeline */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-4">
          <h2 className="text-lg font-semibold mb-4">Your Meetings</h2>
          
          {isLoadingMeetings ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
              <p className="text-gray-500 text-sm">Loading meetings...</p>
            </div>
          ) : sortedMeetings.length === 0 ? (
            <p className="text-gray-500">No meetings scheduled.</p>
          ) : (
            <div className="space-y-3">
              {sortedMeetings.map((meeting) => (
                <div 
                  key={meeting.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    meeting.isCancelled ? 'border-red-200 bg-red-50' :
                    selectedMeeting && selectedMeeting.id === meeting.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium ${meeting.isCancelled ? 'text-red-500 line-through' : 'text-gray-900'}`}>
                      {meeting.subject}
                      {meeting.importance === 'high' && (
                        <span className="ml-2 text-red-500 text-xs">!</span>
                      )}
                    </h3>
                    <span className="text-xs font-medium rounded-full px-2 py-1 bg-blue-100 text-blue-800">
                      {getTimeRemaining(meeting)}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatTime(meeting.start)} - {formatTime(meeting.end)}</span>
                  </div>
                  
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{meeting.location}</span>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex items-center">
                      <CheckSquare className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {meeting.checklistItems.filter(item => item.completed).length} of {meeting.checklistItems.length} tasks complete
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Meeting Details & Prep */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedMeeting ? (
            <div>
              <div className="mb-6">
                <h2 className={`text-2xl font-semibold ${selectedMeeting.isCancelled ? 'text-red-500 line-through' : 'text-gray-900'}`}>
                  {selectedMeeting.subject}
                  {selectedMeeting.importance === 'high' && (
                    <span className="ml-2 text-red-500 text-sm">High Importance</span>
                  )}
                </h2>
                {selectedMeeting.isCancelled && (
                  <div className="text-red-500 mb-2">This meeting has been cancelled</div>
                )}
                <div className="mt-2 flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{formatTime(selectedMeeting.start)} - {formatTime(selectedMeeting.end)}</span>
                </div>
                <div className="mt-1 flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{selectedMeeting.location}</span>
                  {selectedMeeting.onlineMeetingUrl && !selectedMeeting.isCancelled && (
                    <button 
                      className="ml-2 text-blue-600 flex items-center text-sm"
                      onClick={() => joinMeeting(selectedMeeting)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Join Meeting
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Attendees
                </h3>
                <ul className="ml-6 list-disc text-gray-700">
                  {selectedMeeting.attendees.length > 0 ? (
                    selectedMeeting.attendees.map((attendee, index) => (
                      <li key={index}>{attendee}</li>
                    ))
                  ) : (
                    <li>No other attendees</li>
                  )}
                </ul>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">About</h3>
                <p className="text-gray-700">{selectedMeeting.description || "No description available."}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2 flex items-center">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Preparation Notes
                </h3>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg h-32"
                  placeholder="Add your meeting preparation notes here..."
                  value={selectedMeeting.prepNotes}
                  onChange={(e) => handlePrepNotesChange(selectedMeeting.id, e.target.value)}
                ></textarea>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-2 flex items-center">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Preparation Checklist
                </h3>
                
                <div className="space-y-2">
                  {selectedMeeting.checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center group">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(selectedMeeting.id, item.id)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className={`ml-2 flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {item.text}
                      </span>
                      <button 
                        onClick={() => removeChecklistItem(selectedMeeting.id, item.id)}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex">
                  <input
                    type="text"
                    placeholder="Add new checklist item..."
                    className="flex-1 border border-gray-300 rounded-l-lg p-2"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && selectedMeeting) {
                        addChecklistItem(selectedMeeting.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => selectedMeeting && addChecklistItem(selectedMeeting.id)}
                    className="bg-blue-600 text-white px-3 rounded-r-lg flex items-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-8">
                <div className="flex items-center text-amber-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {selectedMeeting.isCancelled 
                      ? "This meeting has been cancelled" 
                      : `Meeting ${
                          new Date() > selectedMeeting.start 
                            ? "started " + getTimeRemaining(selectedMeeting) + " ago" 
                            : "starts in " + getTimeRemaining(selectedMeeting)
                        }`
                    }
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Calendar className="h-12 w-12 mb-2" />
              <p>Select a meeting to prepare</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingPrepApp;