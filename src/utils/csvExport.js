import { db, formatDisplayDate } from '../db/database';

export async function exportAttendanceCSV(dateFilter = null) {
  // Fetch all attendances and labours
  let attendances = await db.attendances.toArray();
  const labours = await db.labours.toArray();
  const labourMap = new Map(labours.map(l => [l.id, l]));

  if (dateFilter) {
    attendances = attendances.filter(a => a.date === dateFilter);
  }

  // Sort chronologically by date, then labour name
  attendances.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    const nameA = labourMap.get(a.labour_id)?.name || '';
    const nameB = labourMap.get(b.labour_id)?.name || '';
    return nameA.localeCompare(nameB);
  });

  // Build CSV Header & Rows
  const headers = ['Date', 'Labour ID', 'Labour Name', 'Trade', 'Status', 'Timestamp'];
  const rows = attendances.map(a => {
    const labour = labourMap.get(a.labour_id);
    const dateFormatted = a.date.split('-').reverse().join('-'); // DD-MM-YYYY format
    const name = labour ? labour.name : 'Unknown';
    const trade = labour ? labour.trade : '-';
    const status = a.status === 'PRESENT' ? 'Present' : 'Absent';
    const timestamp = a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : '';

    return [
      dateFormatted,
      a.labour_id,
      `"${name.replace(/"/g, '""')}"`,
      `"${trade.replace(/"/g, '""')}"`,
      status,
      timestamp
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  // Trigger File Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  const filename = dateFilter 
    ? `Labour_Attendance_${dateFilter}.csv`
    : `Labour_Attendance_All_${new Date().toISOString().split('T')[0]}.csv`;

  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
