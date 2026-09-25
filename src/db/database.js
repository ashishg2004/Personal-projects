import Dexie from 'dexie';

export const db = new Dexie('LabourAttendanceDB');

// Define database schema
db.version(1).stores({
  labours: 'id, name, trade, active, createdAt',
  attendances: 'id, labour_id, date, status, timestamp, [labour_id+date]'
});

// Helper: Format date to YYYY-MM-DD
export function getTodayDateString(overrideDate = null) {
  if (overrideDate) return overrideDate;
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Format YYYY-MM-DD to "23 September 2026" or "23 Sep 2026"
export function formatDisplayDate(dateStr, format = 'full') {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } else if (format === 'dayMonth') {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Helper: Get Month Name & Year for Month filter
export function getMonthYearString(dateStr) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
}

// Helper: Add Labour
export async function addLabour(data) {
  const count = await db.labours.count();
  const newId = `L${String(count + 1).padStart(3, '0')}`;
  
  const newLabour = {
    id: newId,
    name: data.name.trim(),
    phone: data.phone ? data.phone.trim() : '',
    trade: data.trade ? data.trade.trim() : 'General Helper',
    active: true,
    createdAt: new Date().toISOString()
  };

  await db.labours.add(newLabour);
  return newLabour;
}

// Helper: Update Labour
export async function updateLabour(id, updates) {
  await db.labours.update(id, updates);
}

// Helper: Toggle Labour Active
export async function toggleLabourActive(id, currentActiveState) {
  await db.labours.update(id, { active: !currentActiveState });
}

// Helper: Delete Single Labour and their Attendance records
export async function deleteLabour(id) {
  await db.transaction('rw', db.labours, db.attendances, async () => {
    await db.labours.delete(id);
    await db.attendances.where('labour_id').equals(id).delete();
  });
}

// Helper: Clear ALL database data (Labours and Attendances)
export async function clearAllData() {
  await db.transaction('rw', db.labours, db.attendances, async () => {
    await db.labours.clear();
    await db.attendances.clear();
  });
}

// Helper: Save Attendance record (Single record per labour per date)
export async function saveAttendanceRecord(labourId, status, dateStr = getTodayDateString()) {
  const recordId = `${labourId}_${dateStr}`;
  const now = new Date().toISOString();

  await db.attendances.put({
    id: recordId,
    labour_id: labourId,
    date: dateStr,
    status: status, // 'PRESENT' | 'ABSENT'
    timestamp: now
  });
}

// Helper: Seed initial sample data for demo/testing
export async function seedSampleData(force = false) {
  const labourCount = await db.labours.count();
  if (labourCount > 0 && !force) return;

  if (force) {
    await db.labours.clear();
    await db.attendances.clear();
  }

  const sampleLabours = [
    { id: 'L001', name: 'Raj Kumar', phone: '9876543210', trade: 'Mason', active: true, createdAt: new Date().toISOString() },
    { id: 'L002', name: 'Ramesh Kumar', phone: '9876543211', trade: 'Mason', active: true, createdAt: new Date().toISOString() },
    { id: 'L003', name: 'Amit Sharma', phone: '9876543212', trade: 'Helper', active: true, createdAt: new Date().toISOString() },
    { id: 'L004', name: 'Suresh Verma', phone: '9876543213', trade: 'Carpenter', active: true, createdAt: new Date().toISOString() },
    { id: 'L005', name: 'Vikas Singh', phone: '9876543214', trade: 'Plumber', active: true, createdAt: new Date().toISOString() },
    { id: 'L006', name: 'Manoj Gupta', phone: '9876543215', trade: 'Electrician', active: true, createdAt: new Date().toISOString() },
    { id: 'L007', name: 'Dharmendra Yadav', phone: '9876543216', trade: 'Welder', active: true, createdAt: new Date().toISOString() },
    { id: 'L008', name: 'Sunil Paswan', phone: '9876543217', trade: 'Helper', active: true, createdAt: new Date().toISOString() },
    { id: 'L009', name: 'Pankaj Pandit', phone: '9876543218', trade: 'Painter', active: true, createdAt: new Date().toISOString() },
    { id: 'L010', name: 'Deepak Maurya', phone: '9876543219', trade: 'Helper', active: true, createdAt: new Date().toISOString() },
    { id: 'L011', name: 'Rakesh Prasad', phone: '9876543220', trade: 'Mason', active: true, createdAt: new Date().toISOString() },
    { id: 'L012', name: 'Anil Chauhan', phone: '9876543221', trade: 'Bar Bending', active: true, createdAt: new Date().toISOString() },
    { id: 'L013', name: 'Santosh Sah', phone: '9876543222', trade: 'Helper', active: true, createdAt: new Date().toISOString() },
    { id: 'L014', name: 'Jitendra Thakur', phone: '9876543223', trade: 'Tile Fitter', active: true, createdAt: new Date().toISOString() },
    { id: 'L015', name: 'Mukesh Pal', phone: '9876543224', trade: 'Supervisor', active: true, createdAt: new Date().toISOString() }
  ];

  await db.labours.bulkAdd(sampleLabours);

  // Generate 6 days of historical attendance (from 18 Sep to 23 Sep 2026)
  const baseDate = new Date(2026, 8, 23); // 23 Sep 2026
  const attendanceRecords = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    sampleLabours.forEach((labour, idx) => {
      if (i === 0 && idx >= 7) {
        return; // Unmarked for today, so user can test resuming
      }

      const isPresent = (idx * 3 + i * 7) % 7 !== 0;
      attendanceRecords.push({
        id: `${labour.id}_${dateStr}`,
        labour_id: labour.id,
        date: dateStr,
        status: isPresent ? 'PRESENT' : 'ABSENT',
        timestamp: new Date(d.getTime() + 8 * 3600 * 1000).toISOString()
      });
    });
  }

  await db.attendances.bulkAdd(attendanceRecords);
}
