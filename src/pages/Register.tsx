import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API, type Registration } from '../services/api';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { User, Globe, FileCheck, ArrowLeft, ArrowRight, Save, Search } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { committees, countries, refreshData } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields State
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [school, setSchool] = useState('Podar International School');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [portfolio, setPortfolio] = useState<'delegate' | 'executive_committee' | 'vice_chair'>('delegate');
  const [experience, setExperience] = useState('First time delegate');
  const [additional, setAdditional] = useState('');
  const [preferredCommittee, setPreferredCommittee] = useState('');
  const [preferredCountry, setPreferredCountry] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLocked, setIsLocked] = useState(false);

  // Constants mapping
  const committeeGrades: Record<string, number[]> = {
    unep: [7, 8],
    'un-women': [7, 8],
    fao: [7, 8],
    unhrc: [9, 10],
    unicef: [9, 10],
    ecosoc: [9, 10],
  };

  const isCommForGrade = (commId: string, gradeNum: number) => {
    const allowed = committeeGrades[commId.toLowerCase()];
    return allowed ? allowed.includes(gradeNum) : true;
  };

  // Lock committee if query param is set
  useEffect(() => {
    const queryComm = searchParams.get('committee');
    if (queryComm && committees.length > 0) {
      const matched = committees.find((c) => c.id.toLowerCase() === queryComm.toLowerCase());
      if (matched) {
        setPreferredCommittee(matched.id);
        setIsLocked(true);
        // Automatically default grade to first allowed grade
        const allowed = committeeGrades[matched.id.toLowerCase()];
        if (allowed && allowed.length > 0) {
          setGrade(allowed[0].toString());
        }
      }
    }
  }, [searchParams, committees]);

  // Handle grade change and adjust committee lists
  const handleGradeChange = (selectedGrade: string) => {
    setGrade(selectedGrade);
    const gradeNum = parseInt(selectedGrade);
    if (!gradeNum || isLocked) return;

    // Reset preferred committee if invalid for new grade
    if (preferredCommittee && !isCommForGrade(preferredCommittee, gradeNum)) {
      setPreferredCommittee('');
      setPreferredCountry('');
    }
  };

  const handleCommitteeChange = (selectedComm: string) => {
    setPreferredCommittee(selectedComm);
    setPreferredCountry('');

    const allowed = committeeGrades[selectedComm.toLowerCase()];
    if (allowed && allowed.length > 0 && !isLocked) {
      // If current grade is not allowed, reset it to first allowed
      if (!grade || !allowed.includes(parseInt(grade))) {
        setGrade(allowed[0].toString());
      }
    }
  };

  // Validate Step 1
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full Name is required.';
    if (!grade) errs.grade = 'Please select your grade.';
    if (!section.trim()) errs.section = 'Section is required.';
    if (!school.trim()) errs.school = 'School Name is required.';
    if (!email.trim()) {
      errs.email = 'Email Address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!phone.trim()) {
      errs.phone = 'Phone Number is required.';
    } else if (!/^[0-9+\s-]{10,15}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number (10-12 digits).';
    }
    if (!preferredCommittee) errs.preferredCommittee = 'Please select a preferred committee.';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (!preferredCountry) {
        alert('Please choose a preferred country representation.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) return;

    setIsSubmitting(true);
    const mockRegId = `PIS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload: Registration = {
      id: mockRegId,
      name: name.trim(),
      grade: parseInt(grade),
      section: section.trim(),
      school: school.trim(),
      email: email.trim(),
      phone: phone.trim(),
      portfolio_preference: portfolio,
      mun_experience: experience.trim() || 'First time delegate',
      additional_info: additional.trim(),
      preferred_committee: preferredCommittee,
      country_preferences: [preferredCountry],
      committee: 'NOT ASSIGNED',
      assigned_country: 'NOT ASSIGNED',
      status: 'PENDING',
    };

    try {
      const response = await API.submitRegistration(payload);
      // Store session data in localStorage
      localStorage.setItem('pmun_registration_id', response.id);
      localStorage.setItem('pmun_session_role', 'delegate');

      // Reload database configurations
      await refreshData();

      // Navigate to success screen
      navigate(
        `/success?id=${response.id}&name=${encodeURIComponent(response.name)}&grade=${
          response.grade
        }&committee=${encodeURIComponent(
          committees.find((c) => c.id === preferredCommittee)?.name || preferredCommittee
        )}`
      );
    } catch (err: any) {
      alert(`Registration submission failed: ${err.message || 'Server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter countries for preferred committee
  const filteredCountries = countries
    .filter((c) => c.committee_id.toLowerCase() === preferredCommittee.toLowerCase())
    .filter((c) => c.country_name.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalAvailableCount = countries.filter(
    (c) => c.committee_id.toLowerCase() === preferredCommittee.toLowerCase() && c.available
  ).length;

  const totalCommitteeCountries = countries.filter(
    (c) => c.committee_id.toLowerCase() === preferredCommittee.toLowerCase()
  ).length;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-main)',
        padding: '3rem 1.5rem',
        minHeight: 'calc(100vh - 70px - 340px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '780px' }} className="fade-in">
        {/* Cancel Button */}
        {step === 1 && (
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'none',
              color: 'var(--color-primary)',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              padding: 0,
            }}
          >
            <ArrowLeft size={16} /> Cancel Registration
          </button>
        )}

        {/* Wizard Progression nodes */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', position: 'relative' }}>
          {/* Background Bar */}
          <div style={{ position: 'absolute', top: '18px', left: '10%', right: '10%', height: '3px', backgroundColor: 'var(--color-border)', zIndex: 1 }} />
          {/* Foreground Progress Fill */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              left: '10%',
              width: step === 1 ? '0%' : step === 2 ? '40%' : '80%',
              height: '3px',
              backgroundColor: 'var(--color-secondary)',
              zIndex: 1,
              transition: 'width var(--transition-normal)',
            }}
          />

          {[
            { s: 1, label: 'Personal Info', icon: <User size={16} /> },
            { s: 2, label: 'Country Choice', icon: <Globe size={16} /> },
            { s: 3, label: 'Review & Submit', icon: <FileCheck size={16} /> },
          ].map((item) => (
            <div
              key={item.s}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: '2px solid',
                  backgroundColor: step > item.s ? 'var(--color-success)' : step === item.s ? 'var(--color-secondary)' : '#ffffff',
                  borderColor: step > item.s ? 'var(--color-success)' : step === item.s ? 'var(--color-secondary)' : 'var(--color-border)',
                  color: step >= item.s ? '#ffffff' : 'var(--color-text-muted)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {step > item.s ? '✓' : item.icon}
              </div>
              <span
                className="step-label"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  marginTop: '0.5rem',
                  color: step >= item.s ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <Card elevation="lg" style={{ padding: '2.5rem 2rem' }}>
          <form onSubmit={handleSubmit}>
            {/* STEP 1: Personal Info & Committee Selection */}
            {step === 1 && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: '1.4rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                  1. Delegate Personal details
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }} className="grid-responsive">
                  <Input
                    label="Full Name *"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={fieldErrors.name}
                  />
                  <div className="form-group">
                    <label className="form-label">Grade *</label>
                    <select
                      value={grade}
                      onChange={(e) => handleGradeChange(e.target.value)}
                      className="form-control"
                      style={{ borderColor: fieldErrors.grade ? 'var(--color-error)' : undefined }}
                    >
                      <option value="">Select Grade</option>
                      {/* Filter allowed grades based on committee if locked */}
                      {(!preferredCommittee || isCommForGrade(preferredCommittee, 7)) && <option value="7">Grade 7</option>}
                      {(!preferredCommittee || isCommForGrade(preferredCommittee, 8)) && <option value="8">Grade 8</option>}
                      {(!preferredCommittee || isCommForGrade(preferredCommittee, 9)) && <option value="9">Grade 9</option>}
                      {(!preferredCommittee || isCommForGrade(preferredCommittee, 10)) && <option value="10">Grade 10</option>}
                    </select>
                    {fieldErrors.grade && <span className="text-error" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{fieldErrors.grade}</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '1.5rem' }} className="grid-responsive">
                  <Input
                    label="Section *"
                    placeholder="e.g. A"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    error={fieldErrors.section}
                  />
                  <Input
                    label="School Campus *"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    error={fieldErrors.school}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-responsive">
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={fieldErrors.email}
                  />
                  <Input
                    label="Parent Phone Number *"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={fieldErrors.phone}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-responsive">
                  <div className="form-group">
                    <label className="form-label">Preferred Committee *</label>
                    <select
                      value={preferredCommittee}
                      onChange={(e) => handleCommitteeChange(e.target.value)}
                      disabled={isLocked}
                      className="form-control"
                      style={{ borderColor: fieldErrors.preferredCommittee ? 'var(--color-error)' : undefined }}
                    >
                      <option value="">Select Committee</option>
                      {/* Grouping by grade eligibility */}
                      {(!grade || ['7', '8'].includes(grade)) && (
                        <optgroup label="Grades 7 & 8 Committees">
                          {committees
                            .filter((c) => ['unep', 'un-women', 'fao'].includes(c.id.toLowerCase()))
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </optgroup>
                      )}
                      {(!grade || ['9', '10'].includes(grade)) && (
                        <optgroup label="Grades 9 & 10 Committees">
                          {committees
                            .filter((c) => ['unhrc', 'unicef', 'ecosoc'].includes(c.id.toLowerCase()))
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </optgroup>
                      )}
                    </select>
                    {fieldErrors.preferredCommittee && <span className="text-error" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{fieldErrors.preferredCommittee}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Portfolio Preference</label>
                    <select
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value as any)}
                      className="form-control"
                    >
                      <option value="delegate">Delegate representation</option>
                      <option value="executive_committee">Executive Board / Chair</option>
                      <option value="vice_chair">Vice Chair</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Previous MUN Experience"
                  placeholder="List conferences attended or state 'First time delegate'"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />

                <Input
                  label="Additional Information / Dietary Restrictions"
                  as="textarea"
                  placeholder="Any medical details, dietary requirements, or general info..."
                  value={additional}
                  onChange={(e) => setAdditional(e.target.value)}
                />
              </div>
            )}

            {/* STEP 2: Country Choice Selection */}
            {step === 2 && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: '1.4rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                  2. Choose Country Preference
                </h3>

                <div style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                    Committee: {committees.find((c) => c.id === preferredCommittee)?.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Choose your country representation. Only green <strong>"Available"</strong> countries can be selected.
                  </p>
                  <span style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
                    ({totalAvailableCount} of {totalCommitteeCountries} countries currently available)
                  </span>
                </div>

                {/* Country Filter search input */}
                <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '38px', width: '100%' }}
                  />
                </div>

                {/* Country dropdown selection list */}
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Preferred Country *</label>
                  <select
                    value={preferredCountry}
                    onChange={(e) => setPreferredCountry(e.target.value)}
                    className="form-control"
                    required
                  >
                    <option value="" disabled>Choose Country</option>
                    {filteredCountries.map((c) => {
                      const isTaken = !c.available;
                      return (
                        <option
                          key={c.id}
                          value={c.country_name}
                          disabled={isTaken}
                          style={{
                            color: isTaken ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                            fontStyle: isTaken ? 'italic' : 'normal',
                          }}
                        >
                          {c.country_name} {isTaken ? '— Taken' : ''}{c.category ? ` (${c.category})` : ''}
                        </option>
                      );
                    })}
                    {filteredCountries.length === 0 && (
                      <option disabled>No countries match your search filter</option>
                    )}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 3: Review and Submit details */}
            {step === 3 && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: '1.4rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                  3. Review Registration details
                </h3>

                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                  Please review your enrollment information before submitting. Once submitted, your registration status will be marked as PENDING approval by the coordinators.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Personal details info */}
                  <div style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)', fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Personal details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', fontSize: '0.9rem' }} className="grid-responsive">
                      <div><strong>Full Name:</strong> {name}</div>
                      <div><strong>Grade & Section:</strong> Grade {grade} - {section}</div>
                      <div><strong>School Campus:</strong> {school}</div>
                      <div><strong>Portfolio:</strong> {portfolio.replace('_', ' ')}</div>
                      <div><strong>Email:</strong> {email}</div>
                      <div><strong>Phone Number:</strong> {phone}</div>
                    </div>
                  </div>

                  {/* Choice Details */}
                  <div style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)', fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Committee & Country Allocation
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                      <div>
                        <strong>Selected Committee:</strong> {committees.find((c) => c.id === preferredCommittee)?.name} ({preferredCommittee.toUpperCase()})
                      </div>
                      <div>
                        <strong>Country Preference:</strong> <span style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>{preferredCountry}</span>
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)', fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Notes & Background
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                      <div><strong>Experience:</strong> {experience}</div>
                      {additional && <div><strong>Additional Notes:</strong> {additional}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons control */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginTop: '2rem' }}>
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={handlePrev} disabled={isSubmitting}>
                  <ArrowLeft size={16} /> Back
                </Button>
              ) : (
                <div /> // Spacer
              )}

              {step < 3 ? (
                <Button type="button" variant="primary" onClick={handleNext}>
                  Next step
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button type="submit" variant="secondary" loading={isSubmitting}>
                  Submit Application
                  <Save size={16} />
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .step-label {
            font-size: 0.65rem !important;
            letter-spacing: 0.2px !important;
          }
        }
      `}</style>
    </div>
  );
};
