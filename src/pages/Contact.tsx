import React, { useState } from 'react';
import { User, Users, Send, CheckCircle } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const gradeTeam = [
    { grade: '10', inCharge: 'Shalini Pandey', email: 'shalini.pandey1@podar.org', contact: '+91 9265889963' },
    { grade: '9', inCharge: 'Reena Singh', email: 'reena.singh3@podar.org', contact: '+91 7972989376' },
    { grade: '8', inCharge: 'Archana Tripathi', email: 'archana.tripathi@podar.org', contact: '+91 9730031190' },
    { grade: '7', inCharge: 'Karishma Khankule', email: 'karishma.khankule@podar.org', contact: '+91 8378054842' },
  ];

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = 'Full Name is required.';
    if (!email.trim()) {
      tempErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address.';
    }
    if (!message.trim()) {
      tempErrors.message = 'Message content cannot be blank.';
    } else if (message.trim().length < 10) {
      tempErrors.message = 'Message must be at least 10 characters long.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
    setErrors({});
  };

  return (
    <div className="container section fade-in">
      {/* Page Header */}
      <div className="text-center" style={{ marginBottom: '3.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontWeight: 700 }}>
          Contact PMUN Team
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0 1.25rem 0' }}>
          <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
          <span style={{ color: 'var(--color-secondary)', fontSize: '0.55rem' }}>◆</span>
          <div style={{ height: '1.2px', width: '30px', backgroundColor: 'var(--color-border)' }}></div>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
          Get in touch with the PMUN coordinators and team managers for school registrations, details, or assistance.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3rem' }} className="contact-layout">
        {/* Left Side: Directory Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Card 1: PMUN Coordinator */}
          <Card elevation="md" style={{ padding: '2rem' }} hoverable={true}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid var(--color-secondary)', paddingBottom: '0.6rem', marginBottom: '1.5rem' }}>
              <User size={22} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)' }}>
                PMUN Coordinator
              </h3>
            </div>
            
            <div style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.25rem' }}>
              <h4 style={{ color: 'var(--color-primary)', fontSize: '1.2rem', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
                Suman Sinha
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ color: 'var(--color-secondary)' }}>Email:</strong>
                  <a href="mailto:suman.sinha@podar.org" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                    suman.sinha@podar.org
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ color: 'var(--color-secondary)' }}>Contact:</strong>
                  <a href="tel:+919373959534" style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>
                    +91 9373959534
                  </a>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(12, 86, 179, 0.05)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              <strong>Coordinator Responsibility:</strong> Direct inquiries regarding school delegation allocations, overall administrative decisions, and executive planning committees.
            </div>
          </Card>

          {/* Card 2: Grade In-Charges */}
          <Card elevation="md" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid var(--color-secondary)', paddingBottom: '0.6rem', marginBottom: '1.5rem' }}>
              <Users size={22} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)' }}>
                Grade Team Managers
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {gradeTeam.map((member) => (
                <div key={member.grade} style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-secondary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Grade {member.grade} In-Charge
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.98rem' }}>
                      {member.inCharge}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.85rem' }}>
                    <div>
                      <strong style={{ color: 'var(--color-text-muted)', marginRight: '6px' }}>Email:</strong>
                      <a href={`mailto:${member.email}`} style={{ color: 'var(--color-secondary)' }}>{member.email}</a>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--color-text-muted)', marginRight: '6px' }}>Phone:</strong>
                      <a href={`tel:${member.contact.replace(/\s+/g, '')}`} style={{ color: 'var(--color-text-main)' }}>{member.contact}</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: Interactive Form */}
        <div>
          <Card elevation="md" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid var(--color-secondary)', paddingBottom: '0.6rem', marginBottom: '1.5rem' }}>
              <Send size={20} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)' }}>
                Send us a Message
              </h3>
            </div>

            {isSuccess && (
              <div
                style={{
                  backgroundColor: 'var(--color-success-bg)',
                  border: '1px solid var(--color-success)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '1.5rem',
                  fontSize: '0.88rem',
                }}
              >
                <CheckCircle size={18} />
                <span>Thank you! Your message has been sent successfully. We will respond shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Input
                label="Full Name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                disabled={isSubmitting}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@school.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                disabled={isSubmitting}
                required
              />

              <Input
                label="Message"
                as="textarea"
                rows={5}
                placeholder="Enter your query or message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                error={errors.message}
                disabled={isSubmitting}
                required
              />

              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                Send Message
                <Send size={14} />
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .contact-layout {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};
