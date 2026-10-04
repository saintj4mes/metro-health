'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { BranchLocation } from '@/lib/ph-constants';
import {
  ClinicAppointment,
  AppointmentStatus,
  ServiceType,
  INITIAL_APPOINTMENTS,
  getMondayOfWeek,
  getWeekDates,
  OPERATING_HOURS,
} from '@/lib/appointment-store';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Stethoscope,
  Building2,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Columns,
  Grid,
  CalendarDays,
  Phone,
  ShieldCheck,
} from 'lucide-react';

interface AppointmentCalendarMatrixProps {
  branch: BranchLocation;
  onOpenPatientChart: (patientId: string) => void;
  onCheckInToQueue?: (patient: {
    id: string;
    name: string;
    age: number;
    gender: 'M' | 'F';
    dob: string;
    doctor: string;
    chiefComplaint: string;
    senior: boolean;
    pwd: boolean;
  }) => void;
}

export function AppointmentCalendarMatrix({
  branch,
  onOpenPatientChart,
  onCheckInToQueue,
}: AppointmentCalendarMatrixProps) {
  // Navigation State: default to the current active demo week starting Monday, Oct 05, 2026
  const [currentMonday, setCurrentMonday] = useState<Date>(new Date('2026-10-05T00:00:00'));
  const [viewType, setViewType] = useState<'WEEKLY' | 'PROVIDER' | 'MONTHLY'>('WEEKLY');

  // Appointments master dataset (partitioned by branch)
  const [appointments, setAppointments] = useState<ClinicAppointment[]>(INITIAL_APPOINTMENTS);

  // Filters
  const [selectedDoctor, setSelectedDoctor] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [selectedAppointment, setSelectedAppointment] = useState<ClinicAppointment | null>(null);
  const [bookingSlot, setBookingSlot] = useState<{ date: string; hour: number; timeLabel: string } | null>(null);

  // New Booking Form State
  const [newBooking, setNewBooking] = useState({
    patientName: '',
    age: '40',
    gender: 'M' as 'M' | 'F',
    dob: '1986-05-15',
    phone: '+63 9',
    philhealth: '',
    seniorOrPwd: '',
    doctorName: 'Dr. Florence Espinosa, MD',
    serviceType: 'PhilHealth Konsulta (First Visit)' as ServiceType,
    chiefComplaint: '',
  });

  // Week Dates for the active Monday
  const weekDates = getWeekDates(currentMonday);
  const weekStartLabel = weekDates[0].shortDate;
  const weekEndLabel = `${weekDates[6].shortDate}, ${currentMonday.getFullYear()}`;

  // Filter appointments for the current branch workspace and active filters
  const branchAppointments = appointments.filter((apt) => {
    if (apt.branchId !== branch.id) return false;
    if (selectedDoctor !== 'ALL' && apt.doctorName !== selectedDoctor) return false;
    if (selectedService !== 'ALL' && apt.serviceType !== selectedService) return false;
    if (selectedStatus !== 'ALL' && apt.status !== selectedStatus) return false;
    return true;
  });

  // Navigation handlers
  const handlePrevWeek = () => {
    const prev = new Date(currentMonday);
    prev.setDate(prev.getDate() - 7);
    setCurrentMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(next.getDate() + 7);
    setCurrentMonday(next);
  };

  const handleToday = () => {
    setCurrentMonday(new Date('2026-10-05T00:00:00'));
  };

  // Status updates
  const handleUpdateStatus = (appointmentId: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt))
    );
    if (selectedAppointment && selectedAppointment.id === appointmentId) {
      setSelectedAppointment({ ...selectedAppointment, status: newStatus });
    }
  };

  // Handle direct check-in into the active branch queue
  const handleCheckInNow = (apt: ClinicAppointment) => {
    handleUpdateStatus(apt.id, 'CHECKED_IN');
    if (onCheckInToQueue) {
      onCheckInToQueue({
        id: apt.patientId,
        name: apt.patientName,
        age: apt.patientAge,
        gender: apt.patientGender,
        dob: apt.patientDob,
        doctor: apt.doctorName,
        chiefComplaint: apt.chiefComplaint,
        senior: Boolean(apt.seniorId),
        pwd: Boolean(apt.pwdId),
      });
    }
    setSelectedAppointment(null);
  };

  // Handle saving a new booking
  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingSlot) return;

    const newApt: ClinicAppointment = {
      id: `apt-${Date.now().toString().slice(-5)}`,
      patientId: `pat-${Date.now().toString().slice(-4)}`,
      patientName: newBooking.patientName,
      patientAge: Number(newBooking.age) || 35,
      patientGender: newBooking.gender,
      patientDob: newBooking.dob,
      patientPhone: newBooking.phone,
      philhealth: newBooking.philhealth || undefined,
      seniorId: newBooking.seniorOrPwd.includes('OSCA') ? newBooking.seniorOrPwd : undefined,
      pwdId: newBooking.seniorOrPwd.includes('PWD') ? newBooking.seniorOrPwd : undefined,
      branchId: branch.id,
      doctorName: newBooking.doctorName,
      doctorId: 'user-001',
      date: bookingSlot.date,
      timeSlot: bookingSlot.timeLabel,
      hour: bookingSlot.hour,
      durationMinutes: 30,
      serviceType: newBooking.serviceType,
      status: 'CONFIRMED',
      chiefComplaint: newBooking.chiefComplaint || 'Outpatient consultation booking',
    };

    setAppointments((prev) => [...prev, newApt]);
    setBookingSlot(null);

    // Reset form
    setNewBooking({
      patientName: '',
      age: '40',
      gender: 'M',
      dob: '1986-05-15',
      phone: '+63 9',
      philhealth: '',
      seniorOrPwd: '',
      doctorName: 'Dr. Florence Espinosa, MD',
      serviceType: 'PhilHealth Konsulta (First Visit)',
      chiefComplaint: '',
    });
  };

  // Distinct doctors at this branch for filter
  const branchDoctors = Array.from(
    new Set(appointments.filter((a) => a.branchId === branch.id).map((a) => a.doctorName))
  );

  return (
    <div className="space-y-2.5">
      {/* 1. Header Toolbar with Week Navigator & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-cyan-800" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Appointment Schedule
            </h2>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {branch.code}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Facility: <strong className="text-slate-700 dark:text-slate-300">{branch.name}</strong>
          </p>
        </div>

        {/* Center / Right: Week Navigation Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              title="Previous Week"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-white rounded transition dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Current Week
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              title="Next Week"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            {weekStartLabel} – {weekEndLabel}
          </div>

          {/* View Mode Toggle */}
          <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded dark:bg-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewType('WEEKLY')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                viewType === 'WEEKLY'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Weekly Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setViewType('PROVIDER')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                viewType === 'PROVIDER'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Provider View</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setBookingSlot({
                date: weekDates[0].isoDate,
                hour: 9,
                timeLabel: '09:00 AM',
              })
            }
            className="flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Filter className="h-3 w-3" />
            <span className="text-[11px]">Filters:</span>
          </div>

          {/* Doctor Filter */}
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="h-7 rounded border border-slate-200 bg-slate-50 px-2 text-xs text-slate-800 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Attending Clinicians ({branchDoctors.length})</option>
            {branchDoctors.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>

          {/* Service Package Filter */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="h-7 rounded border border-slate-200 bg-slate-50 px-2 text-xs text-slate-800 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Service Packages</option>
            <option value="PhilHealth Konsulta (First Visit)">PhilHealth Konsulta</option>
            <option value="Follow-up Consultation">Follow-up Consultation</option>
            <option value="Pulmonary Assessment (CAP Review)">Pulmonary Review</option>
            <option value="Diabetes & Endocrine Health Review">Diabetes / Endocrine</option>
            <option value="Executive Annual Physical Exam">Executive Physical</option>
            <option value="Antenatal Routine Checkup">Antenatal Care</option>
            <option value="Pre-Employment Medical Clearance">Pre-Employment Clearance</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-7 rounded border border-slate-200 bg-slate-50 px-2 text-xs text-slate-800 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed Bookings</option>
            <option value="CHECKED_IN">Checked-In Patients</option>
            <option value="COMPLETED">Completed Encounters</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Showing <strong>{branchAppointments.length}</strong> bookings
        </div>
      </div>

      {/* 3. Primary Weekly Calendar Matrix Grid */}
      {viewType === 'WEEKLY' && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-x-auto dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full border-collapse text-xs min-w-[900px]">
            {/* Header Row: 7 Days */}
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 dark:bg-slate-800/80 dark:border-slate-700">
                <th className="w-16 px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 border-r border-slate-200 dark:border-slate-700">
                  Time
                </th>
                {weekDates.map((day) => {
                  const dayAppointments = branchAppointments.filter((a) => a.date === day.isoDate);
                  const isToday =
                    day.isoDate === new Date().toISOString().split('T')[0] ||
                    day.isoDate === '2026-10-05';

                  return (
                    <th
                      key={day.isoDate}
                      className={`px-2.5 py-1.5 text-left border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${
                        isToday ? 'bg-cyan-50/50 dark:bg-cyan-950/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-bold text-xs ${isToday ? 'text-cyan-900 dark:text-cyan-300' : 'text-slate-900 dark:text-white'}`}>
                            {day.dayName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{day.shortDate}</div>
                        </div>
                        {dayAppointments.length > 0 && (
                          <span className="rounded-full bg-cyan-100 text-cyan-800 px-1.5 py-0.2 text-[9px] font-bold">
                            {dayAppointments.length}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Matrix Body: Operating Hours x 7 Days */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {OPERATING_HOURS.map((slot) => (
                <tr key={slot.hour} className="group/row hover:bg-slate-50/30">
                  {/* Time Axis Column */}
                  <td className="px-1.5 py-2 text-center font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/60 dark:bg-slate-800/40 border-r border-slate-200 dark:border-slate-700 select-none">
                    {slot.label}
                  </td>

                  {/* Day Cells */}
                  {weekDates.map((day) => {
                    const cellAppointments = branchAppointments.filter(
                      (a) => a.date === day.isoDate && a.hour === slot.hour
                    );

                    return (
                      <td
                        key={day.isoDate}
                        className="p-1 align-top border-r border-slate-100 dark:border-slate-800 last:border-r-0 h-16 transition group/cell relative"
                      >
                        {cellAppointments.length > 0 ? (
                          <div className="space-y-1">
                            {cellAppointments.map((apt) => {
                              const isConfirmed = apt.status === 'CONFIRMED';
                              const isCheckedIn = apt.status === 'CHECKED_IN';
                              const isCompleted = apt.status === 'COMPLETED';

                              return (
                                <div
                                  key={apt.id}
                                  onClick={() => setSelectedAppointment(apt)}
                                  className={`rounded p-1 border text-left cursor-pointer transition shadow-2xs ${
                                    isCheckedIn
                                      ? 'border-blue-400 bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:border-blue-700 dark:text-blue-200'
                                      : isConfirmed
                                      ? 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-200'
                                      : isCompleted
                                      ? 'border-slate-300 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 opacity-80'
                                      : 'border-rose-300 bg-rose-50 text-rose-900'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-[10px] truncate">{apt.patientName}</span>
                                    {apt.seniorId && (
                                      <span className="rounded bg-amber-200/80 px-1 py-0.1 text-[8px] font-bold text-amber-900 shrink-0">
                                        SC
                                      </span>
                                    )}
                                    {apt.pwdId && (
                                      <span className="rounded bg-purple-200/80 px-1 py-0.1 text-[8px] font-bold text-purple-900 shrink-0">
                                        PWD
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[9px] text-slate-500 font-mono">
                                    {apt.timeSlot} &middot; {apt.doctorName.split(',')[0]}
                                  </div>
                                  <div className="text-[9px] text-slate-600 dark:text-slate-400 truncate">
                                    {apt.serviceType}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* Empty Slot Quick Booking Button on Hover */
                          <button
                            type="button"
                            onClick={() =>
                              setBookingSlot({
                                date: day.isoDate,
                                hour: slot.hour,
                                timeLabel: slot.label,
                              })
                            }
                            className="opacity-0 group-hover/cell:opacity-100 flex items-center justify-center w-full h-full rounded border border-dashed border-slate-300 hover:border-cyan-700 hover:bg-cyan-50/40 text-[9px] text-slate-500 hover:text-cyan-800 transition"
                          >
                            + {slot.label}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Provider Column Matrix View */}
      {viewType === 'PROVIDER' && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-x-auto dark:border-slate-800 dark:bg-slate-900">
          <div className="p-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 flex justify-between items-center dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            <span>Provider Schedule for Monday, Oct 05, 2026 ({branch.name})</span>
            <span className="text-slate-500">Side-by-side clinician assignment</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800">
            {branchDoctors.map((doc) => {
              const docAppointments = branchAppointments.filter((a) => a.doctorName === doc);

              return (
                <div key={doc} className="p-3 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{doc}</div>
                      <div className="text-[10px] text-slate-500">Attending Consultant</div>
                    </div>
                    <span className="rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold px-1.5 py-0.5">
                      {docAppointments.length} Booked
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {docAppointments.length === 0 ? (
                      <div className="text-center py-6 text-[11px] text-slate-400 italic">
                        No appointments booked for this clinician
                      </div>
                    ) : (
                      docAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => setSelectedAppointment(apt)}
                          className="p-2 rounded border border-slate-200 bg-slate-50/60 hover:bg-slate-100 cursor-pointer transition text-xs dark:border-slate-700 dark:bg-slate-800"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-900 dark:text-white">{apt.patientName}</span>
                            <span className="font-mono text-[10px] text-slate-500">{apt.timeSlot}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                            {apt.serviceType}
                          </div>
                          <div className="flex items-center justify-between mt-1 text-[10px]">
                            <span className="text-slate-400">{apt.date}</span>
                            <span className="font-bold text-cyan-800 dark:text-cyan-400">{apt.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Appointment Detail & Quick Action Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg border border-slate-300 bg-white p-3.5 sm:p-4 shadow-2xl text-slate-900 dark:bg-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-cyan-800" />
                <h3 className="font-bold text-xs sm:text-sm">Appointment Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              {/* Patient Banner */}
              <div className="rounded bg-slate-50 p-2.5 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 flex justify-between items-start">
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedAppointment.patientName}
                    {selectedAppointment.seniorId && (
                      <span className="rounded bg-amber-100 text-amber-900 px-1.5 py-0.2 text-[9px] font-bold">
                        Senior (RA 9994)
                      </span>
                    )}
                    {selectedAppointment.pwdId && (
                      <span className="rounded bg-purple-100 text-purple-900 px-1.5 py-0.2 text-[9px] font-bold">
                        PWD (RA 10754)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {selectedAppointment.patientGender}, {selectedAppointment.patientAge}y &middot; DOB: {selectedAppointment.patientDob}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-2">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{selectedAppointment.patientPhone}</span>
                    {selectedAppointment.philhealth && (
                      <span className="font-mono text-slate-500">PIN: {selectedAppointment.philhealth}</span>
                    )}
                  </div>
                </div>

                <span
                  className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                    selectedAppointment.status === 'CHECKED_IN'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedAppointment.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {selectedAppointment.status}
                </span>
              </div>

              {/* Consultation Context */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">Schedule</span>
                  <strong className="text-slate-900 dark:text-white font-mono text-xs">
                    {selectedAppointment.date} at {selectedAppointment.timeSlot}
                  </strong>
                  <span className="text-[10px] text-slate-500 block">Duration: {selectedAppointment.durationMinutes} mins</span>
                </div>

                <div className="p-2 rounded border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">Clinician</span>
                  <strong className="text-slate-900 dark:text-white text-xs">{selectedAppointment.doctorName}</strong>
                  <span className="text-[10px] text-slate-500 block">{branch.name}</span>
                </div>
              </div>

              {/* Service & Complaint */}
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Service Package & Reason
                </span>
                <div className="p-2 rounded border border-slate-200 bg-white font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  <div>Package: <strong>{selectedAppointment.serviceType}</strong></div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 font-normal">
                    Complaint: {selectedAppointment.chiefComplaint}
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Status:</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'CONFIRMED')}
                    className="rounded border border-slate-200 px-2 py-0.5 text-[10px] font-semibold hover:bg-slate-100"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'COMPLETED')}
                    className="rounded border border-slate-200 px-2 py-0.5 text-[10px] font-semibold hover:bg-slate-100"
                  >
                    Complete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'CANCELLED')}
                    className="rounded border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPatientChart(selectedAppointment.patientId);
                      setSelectedAppointment(null);
                    }}
                    className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Patient Chart
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCheckInNow(selectedAppointment)}
                    className="flex items-center gap-1 rounded bg-cyan-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-cyan-900 transition shadow-2xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Check-In</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Quick Booking Modal (when clicking an empty cell or 'New Booking') */}
      {bookingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg border border-slate-300 bg-white p-3.5 sm:p-4 shadow-2xl text-slate-900 dark:bg-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-cyan-800" />
                  Schedule Appointment Booking
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Slot: <strong>{bookingSlot.date}</strong> at <strong>{bookingSlot.timeLabel}</strong> &middot; {branch.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingSlot(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="mt-3 space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Patient Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Elena Dimagiba"
                  value={newBooking.patientName}
                  onChange={(e) => setNewBooking({ ...newBooking, patientName: e.target.value })}
                  className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Age</label>
                  <input
                    type="number"
                    value={newBooking.age}
                    onChange={(e) => setNewBooking({ ...newBooking, age: e.target.value })}
                    className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Gender</label>
                  <select
                    value={newBooking.gender}
                    onChange={(e) => setNewBooking({ ...newBooking, gender: e.target.value as 'M' | 'F' })}
                    className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-700"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newBooking.dob}
                    onChange={(e) => setNewBooking({ ...newBooking, dob: e.target.value })}
                    className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Contact Phone</label>
                  <input
                    required
                    type="text"
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                    className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">PhilHealth / ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 12-XXXXXXXXX-X"
                    value={newBooking.philhealth}
                    onChange={(e) => setNewBooking({ ...newBooking, philhealth: e.target.value })}
                    className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Clinician</label>
                  <select
                    value={newBooking.doctorName}
                    onChange={(e) => setNewBooking({ ...newBooking, doctorName: e.target.value })}
                    className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-700"
                  >
                    <option value="Dr. Florence Espinosa, MD">Dr. Florence Espinosa, MD, FPOGS</option>
                    <option value="Dr. Roberto Gomez, MD">Dr. Roberto Gomez, MD (Visiting)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Consultation Service</label>
                  <select
                    value={newBooking.serviceType}
                    onChange={(e) => setNewBooking({ ...newBooking, serviceType: e.target.value as ServiceType })}
                    className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-700"
                  >
                    <option value="PhilHealth Konsulta (First Visit)">PhilHealth Konsulta (First Visit)</option>
                    <option value="Follow-up Consultation">Follow-up Consultation</option>
                    <option value="Pulmonary Assessment (CAP Review)">Pulmonary Assessment</option>
                    <option value="Diabetes & Endocrine Health Review">Diabetes & Endocrine Review</option>
                    <option value="Executive Annual Physical Exam">Executive Annual Physical</option>
                    <option value="Antenatal Routine Checkup">Antenatal Routine Checkup</option>
                    <option value="Pre-Employment Medical Clearance">Pre-Employment Clearance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Chief Complaint / Purpose</label>
                <textarea
                  rows={2}
                  placeholder="Reason for consultation..."
                  value={newBooking.chiefComplaint}
                  onChange={(e) => setNewBooking({ ...newBooking, chiefComplaint: e.target.value })}
                  className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-700"
                />
              </div>

              <div className="mt-3 flex justify-end gap-2 pt-2.5 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBookingSlot(null)}
                  className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
