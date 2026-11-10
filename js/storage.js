/**
 * MindMitra — Local Storage & User Authentication Management
 * Provides user registration, login authentication, local data persistence, and session state.
 */

(function () {
  const STORAGE_KEYS = {
    USER: 'mindmitra_user',
    REGISTERED_USERS: 'mindmitra_registered_users',
    CHECK_INS: 'mindmitra_checkins',
    ROOMS: 'mindmitra_peer_rooms',
    MESSAGES: 'mindmitra_peer_messages',
    JOURNAL: 'mindmitra_journal',
    REMINDERS: 'mindmitra_reminders',
  };

  // Calming anonymous aliases for peer interactions
  const ANONYMOUS_ALIASES = [
    'Calm River', 'Gentle Pine', 'Quiet Willow', 'Mindful Cedar',
    'Peaceful Heron', 'Patient Oak', 'Serene Meadow', 'Tranquil Brook',
    'Warm Breeze', 'Steady Mountain', 'Gentle Falcon', 'Quiet Sparrow'
  ];

  function generateAnonymousAlias() {
    const name = ANONYMOUS_ALIASES[Math.floor(Math.random() * ANONYMOUS_ALIASES.length)];
    const num = Math.floor(100 + Math.random() * 900);
    return `${name} #${num}`;
  }

  // Pre-seed sample registered account if repository is empty
  function getSeedRegisteredUsers() {
    return [
      {
        id: 'usr_sample_01',
        email: 'student@college.edu',
        password: 'password123',
        name: 'Aarav Sharma',
        alias: 'Quiet Cedar #108',
        role: 'student',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
      {
        id: 'usr_sample_02',
        email: 'mentor@college.edu',
        password: 'password123',
        name: 'Priya Patel',
        alias: 'Patient Oak #204',
        role: 'mentor',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      }
    ];
  }

  // Pre-generate 7 realistic baseline check-ins if store is empty
  function generateBaselineCheckIns() {
    const list = [];
    const now = new Date();
    const mockScores = [62, 65, 59, 72, 68, 75, 78];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const score = mockScores[6 - i];
      const mood = Math.max(0, Math.min(4, Math.round((score - 40) / 12)));
      const sleep = Math.max(1, Math.min(3, Math.round(score / 30)));
      const load = Math.max(1, Math.min(3, Math.round((100 - score) / 28)));

      list.push({
        id: 'chk_' + d.getTime() + '_' + i,
        mood: mood,
        sleep_quality: sleep,
        academic_load: load,
        support_signal: score,
        created_at: d.toISOString(),
      });
    }
    return list;
  }

  // Initial Rooms Seed
  function generateInitialRooms() {
    const now = new Date();
    const d1 = new Date(now.getTime() - 1000 * 60 * 25);
    const d2 = new Date(now.getTime() - 1000 * 60 * 8);

    return [
      {
        id: 'room_waiting_01',
        student_id: 'student_921',
        student_alias: 'Quiet Sparrow #42',
        mentor_id: null,
        status: 'waiting',
        created_at: d1.toISOString(),
      },
      {
        id: 'room_active_sample',
        student_id: 'usr_sample_01',
        student_alias: 'Quiet Cedar #108',
        mentor_id: 'usr_sample_02',
        status: 'active',
        created_at: d2.toISOString(),
      },
    ];
  }

  const Storage = {
    // Registered Users Repository
    getRegisteredUsers() {
      const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      if (!raw) {
        const seed = getSeedRegisteredUsers();
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(seed));
        return seed;
      }
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    },

    saveRegisteredUsers(users) {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
    },

    // User Registration
    registerUser({ email, password, name, role }) {
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      const users = this.getRegisteredUsers();
      const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (existing) {
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      }

      const newUser = {
        id: 'usr_' + Date.now(),
        email: normalizedEmail,
        password: password,
        name: (name || '').trim() || normalizedEmail.split('@')[0],
        alias: generateAnonymousAlias(),
        role: role === 'mentor' ? 'mentor' : 'student',
        created_at: new Date().toISOString(),
      };

      users.push(newUser);
      this.saveRegisteredUsers(users);

      // Automatically set active session
      this.setUser(newUser);
      return { success: true, user: newUser };
    },

    // User Login
    loginUser(email, password) {
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (!normalizedEmail || !password) {
        return { success: false, error: 'Please enter both your email and password.' };
      }

      const users = this.getRegisteredUsers();
      const user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);

      if (!user) {
        return { success: false, error: 'Invalid email or password. Please verify your credentials.' };
      }

      // Set active session
      this.setUser(user);
      return { success: true, user: user };
    },

    // Current Session Management
    getUser() {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (!data) {
        return null;
      }
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    },

    setUser(user) {
      if (user) {
        // Strip sensitive password before writing to session
        const sessionUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          alias: user.alias,
          role: user.role,
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(sessionUser));
        window.dispatchEvent(new CustomEvent('mindmitra:user-updated', { detail: sessionUser }));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.dispatchEvent(new CustomEvent('mindmitra:user-updated', { detail: null }));
      }
    },

    setRole(role) {
      const user = this.getUser();
      if (user) {
        user.role = role;
        this.setUser(user);
        // Also update in registered repository
        const users = this.getRegisteredUsers();
        const found = users.find(u => u.id === user.id);
        if (found) {
          found.role = role;
          this.saveRegisteredUsers(users);
        }
      }
    },

    logout() {
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.dispatchEvent(new CustomEvent('mindmitra:user-updated', { detail: null }));
    },

    // Check-Ins Management
    getCheckIns() {
      const data = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
      if (!data) {
        const baseline = generateBaselineCheckIns();
        this.saveCheckInsList(baseline);
        return baseline;
      }
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    },

    saveCheckInsList(list) {
      localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(list));
    },

    addCheckIn(entry) {
      const list = this.getCheckIns();
      const newEntry = {
        id: 'chk_' + Date.now(),
        mood: entry.mood,
        sleep_quality: entry.sleepQuality,
        academic_load: entry.academicLoad,
        support_signal: entry.supportSignal,
        created_at: new Date().toISOString(),
      };
      list.unshift(newEntry);
      this.saveCheckInsList(list);
      window.dispatchEvent(new CustomEvent('mindmitra:checkin-saved', { detail: newEntry }));
      return newEntry;
    },

    // Peer Support Rooms
    getRooms() {
      const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
      if (!data) {
        const rooms = generateInitialRooms();
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
        return rooms;
      }
      try {
        return JSON.parse(data);
      } catch (e) {
        return [];
      }
    },

    getActiveRoomForStudent(studentId) {
      const rooms = this.getRooms();
      return rooms.find((r) => r.student_id === studentId && (r.status === 'active' || r.status === 'waiting'));
    },

    createPeerRoom(studentId, studentAlias) {
      const rooms = this.getRooms();
      const existing = rooms.find((r) => r.student_id === studentId && (r.status === 'active' || r.status === 'waiting'));
      if (existing) return existing;

      const newRoom = {
        id: 'room_' + Date.now(),
        student_id: studentId,
        student_alias: studentAlias,
        mentor_id: null,
        status: 'waiting',
        created_at: new Date().toISOString(),
      };
      rooms.unshift(newRoom);
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
      return newRoom;
    },

    claimRoom(roomId, mentorId) {
      const rooms = this.getRooms();
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        room.mentor_id = mentorId;
        room.status = 'active';
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
      }
      return room;
    },

    closeRoom(roomId) {
      const rooms = this.getRooms();
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        room.status = 'closed';
        room.closed_at = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
      }
      return room;
    },

    // Peer & AI Messages
    getMessages(roomId) {
      const all = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      let parsed = {};
      if (all) {
        try {
          parsed = JSON.parse(all);
        } catch (e) {
          parsed = {};
        }
      }
      if (!parsed[roomId]) {
        parsed[roomId] = [
          {
            id: 'msg_welcome',
            room_id: roomId,
            sender_id: 'mitra_ai',
            sender_name: 'Mitra (AI Assistant)',
            body: "Welcome to MindMitra's confidential space. I'm here to listen, support, and help you work through whatever is feeling heavy today. What's on your mind?",
            created_at: new Date().toISOString(),
          },
        ];
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(parsed));
      }
      return parsed[roomId];
    },

    addMessage(roomId, senderId, senderName, body) {
      const all = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      let parsed = {};
      if (all) {
        try {
          parsed = JSON.parse(all);
        } catch (e) {
          parsed = {};
        }
      }
      if (!parsed[roomId]) parsed[roomId] = [];

      const newMsg = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        room_id: roomId,
        sender_id: senderId,
        sender_name: senderName,
        body: body,
        created_at: new Date().toISOString(),
      };

      parsed[roomId].push(newMsg);
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(parsed));
      window.dispatchEvent(new CustomEvent('mindmitra:message-sent', { detail: newMsg }));
      return newMsg;
    },

    // Journal
    getJournal() {
      return localStorage.getItem(STORAGE_KEYS.JOURNAL) || '';
    },

    saveJournal(content) {
      localStorage.setItem(STORAGE_KEYS.JOURNAL, content);
    },

    // Reminders
    getReminders() {
      return localStorage.getItem(STORAGE_KEYS.REMINDERS) === 'true';
    },

    setReminders(enabled) {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, enabled ? 'true' : 'false');
    },

    // Export all data as JSON
    exportAllData() {
      const exportObject = {
        mindmitra_version: '2.0.0',
        exported_at: new Date().toISOString(),
        user: this.getUser(),
        registered_users: this.getRegisteredUsers().map(u => ({ id: u.id, email: u.email, name: u.name, alias: u.alias, role: u.role })),
        check_ins: this.getCheckIns(),
        journal: this.getJournal(),
        reminders_enabled: this.getReminders(),
      };
      const jsonString = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `mindmitra-data-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    },

    // Clear all app data
    clearAllData() {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.REGISTERED_USERS);
      localStorage.removeItem(STORAGE_KEYS.CHECK_INS);
      localStorage.removeItem(STORAGE_KEYS.ROOMS);
      localStorage.removeItem(STORAGE_KEYS.MESSAGES);
      localStorage.removeItem(STORAGE_KEYS.JOURNAL);
      localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    },
  };

  // Attach to window
  window.MindMitraStorage = Storage;
})();
