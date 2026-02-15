'use client';

import { useState, useEffect } from 'react';
import { useRole, Role } from '@/lib/role-context';
import { getInstructors, getStudents } from '@/lib/store';
import { InstructorProfile, Student } from '@/lib/types';
import { Shield, GraduationCap, Music, User, ArrowRight } from 'lucide-react';

export function RolePicker() {
  const { setRole } = useRole();
  const [step, setStep] = useState<'role' | 'pick-instructor' | 'pick-student'>('role');
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    setInstructors(getInstructors());
    setStudents(getStudents());
  }, []);

  const handleRoleSelect = (role: Role) => {
    if (role === 'admin') {
      setRole('admin');
      return;
    }
    if (role === 'instructor') {
      if (instructors.length === 0) {
        setRole('instructor', null);
      } else {
        setStep('pick-instructor');
      }
      return;
    }
    if (role === 'student') {
      if (students.length === 0) {
        setRole('student', null);
      } else {
        setStep('pick-student');
      }
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <Music className="h-10 w-10 text-primary" />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-primary tracking-wide">ELEVATED</h1>
              <p className="text-xs text-[#8a8a8a] tracking-[0.25em] uppercase -mt-0.5">Music Center</p>
            </div>
          </div>
          <p className="text-[#8a8a8a]">Select your role to continue</p>
        </div>

        {step === 'role' && (
          <div className="space-y-3">
            {([
              { role: 'admin' as Role, icon: Shield, title: 'Admin', desc: 'Full access to manage everything' },
              { role: 'instructor' as Role, icon: GraduationCap, title: 'Instructor', desc: 'View your schedule, students & profile' },
              { role: 'student' as Role, icon: User, title: 'Student', desc: 'See announcements, instructors & your lessons' },
            ]).map(({ role, icon: Icon, title, desc }) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className="w-full flex items-center gap-4 p-5 rounded-xl bg-[#151515] border border-[#252525] hover:border-primary hover:bg-[#1c1708]/30 transition-all duration-200 text-left group"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{title}</h3>
                  <p className="text-[#8a8a8a] text-sm">{desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[#8a8a8a] group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        )}

        {step === 'pick-instructor' && (
          <div className="space-y-3">
            <button onClick={() => setStep('role')} className="text-sm text-[#8a8a8a] hover:text-primary transition-colors">← Back</button>
            <h2 className="text-white text-xl font-semibold">Which instructor are you?</h2>
            {instructors.map(inst => (
              <button
                key={inst.id}
                onClick={() => setRole('instructor', inst.id)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#151515] border border-[#252525] hover:border-primary hover:bg-[#1c1708]/30 transition-all duration-200 text-left"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{inst.name}</h3>
                  <p className="text-[#8a8a8a] text-xs">{inst.instruments.join(', ')}</p>
                </div>
              </button>
            ))}
            <button
              onClick={() => setRole('instructor', null)}
              className="w-full p-4 rounded-xl border border-dashed border-[#252525] hover:border-primary text-[#8a8a8a] hover:text-primary text-sm transition-all duration-200"
            >
              + I&apos;m a new instructor
            </button>
          </div>
        )}

        {step === 'pick-student' && (
          <div className="space-y-3">
            <button onClick={() => setStep('role')} className="text-sm text-[#8a8a8a] hover:text-primary transition-colors">← Back</button>
            <h2 className="text-white text-xl font-semibold">Which student are you?</h2>
            {students.map(stu => (
              <button
                key={stu.id}
                onClick={() => setRole('student', stu.id)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#151515] border border-[#252525] hover:border-primary hover:bg-[#1c1708]/30 transition-all duration-200 text-left"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{stu.name}</h3>
                  <p className="text-[#8a8a8a] text-xs">{stu.instruments.join(', ')} • {stu.skillLevel}</p>
                </div>
              </button>
            ))}
            <button
              onClick={() => setRole('student', null)}
              className="w-full p-4 rounded-xl border border-dashed border-[#252525] hover:border-primary text-[#8a8a8a] hover:text-primary text-sm transition-all duration-200"
            >
              + I&apos;m a new student
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
