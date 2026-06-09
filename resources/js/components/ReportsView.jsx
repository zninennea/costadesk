import React, { useState, useEffect } from 'react';
import { BarChart3, Users, DollarSign, BedDouble, Calendar, CheckSquare, Clock, Download } from 'lucide-react';
import api from '../api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ReportsView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/reports/dashboard-stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!stats) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("CoastaDesk Management Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Summary Table
    const tableData = [
      ["Today's Revenue", `Php ${parseFloat(stats.today_revenue).toLocaleString(undefined, {minimumFractionDigits: 2})}`],
      ["Monthly Revenue", `Php ${parseFloat(stats.monthly_revenue).toLocaleString(undefined, {minimumFractionDigits: 2})}`],
      ["Total Lifetime Revenue", `Php ${parseFloat(stats.total_revenue).toLocaleString(undefined, {minimumFractionDigits: 2})}`],
      ["Occupancy Rate", `${stats.occupancy_rate}% (${stats.occupied_rooms}/${stats.total_rooms} rooms)`],
      ["Pending Approvals", `${stats.pending_approvals} requests`],
      ["Today's Check-ins", `${stats.today_check_ins} expected`],
      ["Today's Check-outs", `${stats.today_check_outs} expected`],
      ["Total Users / Guests", `${stats.total_users} (Includes ${stats.total_guests} guests)`]
    ];

    doc.autoTable({
      startY: 40,
      head: [['Metric', 'Value']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 118, 110] }, // Teal color matching bg-primary
    });

    doc.save("CoastaDesk_Report.pdf");
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading reports data...</div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Failed to load reports.</div>;

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h4 className="text-3xl font-bold text-gray-800 mt-2">{value}</h4>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      {subtitle && <p className="text-xs text-gray-400 font-medium">{subtitle}</p>}
    </div>
  );

  return (
    <div className="bg-bg-base p-6 rounded-xl h-full w-full max-w-7xl mx-auto mt-4 border border-gray-200">
      <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-200">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-primary w-8 h-8" />
          <h2 className="text-2xl font-bold text-gray-800">Business Reports Overview</h2>
        </div>
        <button 
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition shadow-sm font-medium"
        >
          <Download size={18} />
          Export to PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Revenue" 
          value={`₱${parseFloat(stats.today_revenue).toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
          icon={<DollarSign className="w-6 h-6 text-primary" />} 
          color="bg-primary/10"
          subtitle="Total successful payments today"
        />
        <StatCard 
          title="Monthly Revenue" 
          value={`₱${parseFloat(stats.monthly_revenue).toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
          icon={<BarChart3 className="w-6 h-6 text-primary" />} 
          color="bg-primary/10"
          subtitle="Total successful payments this month"
        />
        <StatCard 
          title="Occupancy Rate" 
          value={`${stats.occupancy_rate}%`} 
          icon={<BedDouble className="w-6 h-6 text-secondary" />} 
          color="bg-secondary/10"
          subtitle={`${stats.occupied_rooms} of ${stats.total_rooms} rooms occupied`}
        />
        <StatCard 
          title="Pending Approvals" 
          value={stats.pending_approvals} 
          icon={<Clock className="w-6 h-6 text-secondary" />} 
          color="bg-secondary/10"
          subtitle="Cancellations awaiting review"
        />
        <StatCard 
          title="Today's Check-ins" 
          value={stats.today_check_ins} 
          icon={<CheckSquare className="w-6 h-6 text-primary" />} 
          color="bg-primary/10"
          subtitle="Expected arrivals today"
        />
        <StatCard 
          title="Today's Check-outs" 
          value={stats.today_check_outs} 
          icon={<Calendar className="w-6 h-6 text-primary" />} 
          color="bg-primary/10"
          subtitle="Expected departures today"
        />
        <StatCard 
          title="Total Users" 
          value={stats.total_users} 
          icon={<Users className="w-6 h-6 text-primary" />} 
          color="bg-primary/10"
          subtitle={`Including ${stats.total_guests} registered guests`}
        />
        <StatCard 
          title="Total Lifetime Revenue" 
          value={`₱${parseFloat(stats.total_revenue).toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
          icon={<DollarSign className="w-6 h-6 text-primary" />} 
          color="bg-primary/10"
          subtitle="All successful payments to date"
        />
      </div>
    </div>
  );
}
