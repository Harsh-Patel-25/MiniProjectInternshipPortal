import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './InternshipCard.css';

const typeColors = {
  remote: 'success',
  onsite: 'primary',
  hybrid: 'warning'
};

const typeIcons = {
  remote: <i className="fa-solid fa-globe" aria-hidden></i>,
  onsite: <i className="fa-solid fa-building" aria-hidden></i>,
  hybrid: <i className="fa-solid fa-arrows-rotate" aria-hidden></i>
};

const InternshipCard = ({ internship, showSave, onSave, isSaved }) => {
  const {
    _id, title, company, companyLogo, location, type, category,
    stipend, duration, applicationDeadline, skills, isFeatured, applicationsCount
  } = internship;

  const daysLeft = Math.ceil((new Date(applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 5;
  const isExpired = daysLeft < 0;

  const formatStipend = () => {
    if (stipend?.type === 'unpaid') return 'Unpaid';
    if (!stipend?.amount) return 'Stipend N/A';
    return `₹${stipend.amount.toLocaleString('en-IN')}/month`;
  };

  const companyInitial = company?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className={`internship-card ${isFeatured ? 'featured' : ''} ${isExpired ? 'expired' : ''}`}>
      {isFeatured && <div className="featured-badge"><i className="fa-solid fa-star"></i> Featured</div>}
      {isUrgent && !isExpired && <div className="urgent-badge"><i className="fa-solid fa-fire"></i> {daysLeft}d left</div>}

      <div className="card-header">
        <div className="company-logo-wrap">
          {companyLogo ? (
            <img src={companyLogo} alt={company} className="company-logo" />
          ) : (
            <div className="company-initial">{companyInitial}</div>
          )}
        </div>
        <div className="card-meta">
          <h3 className="card-title">
            <Link to={`/internships/${_id}`}>{title}</Link>
          </h3>
          <p className="company-name">{company}</p>
        </div>
        {showSave && (
          <button className={`save-btn ${isSaved ? 'saved' : ''}`} onClick={() => onSave && onSave(_id)}>
            {isSaved ? <i className="fa-solid fa-bookmark" aria-hidden></i> : <i className="fa-regular fa-bookmark" aria-hidden></i>}
            <span className="save-tooltip">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        )}
      </div>

      <div className="card-tags">
        <span className={`badge badge-${typeColors[type] || 'gray'}`}>
          {typeIcons[type]} {type?.charAt(0).toUpperCase() + type?.slice(1)}
        </span>
        <span className="badge badge-gray"><i className="fa-solid fa-location-dot" aria-hidden></i> {location}</span>
      </div>

      <div className="card-details">
        <div className="detail-item">
          <span className="detail-label"><i className="fa-solid fa-indian-rupee-sign" aria-hidden></i> Stipend</span>
          <span className="detail-value stipend">{formatStipend()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label"><i className="fa-solid fa-hourglass-half" aria-hidden></i> Duration</span>
          <span className="detail-value">{duration}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label"><i className="fa-solid fa-calendar-days" aria-hidden></i> Deadline</span>
          <span className={`detail-value ${isExpired ? 'text-error' : isUrgent ? 'text-warning' : ''}`}>
            {isExpired ? 'Expired' : format(new Date(applicationDeadline), 'MMM dd, yyyy')}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label"><i className="fa-solid fa-users" aria-hidden></i> Applied</span>
          <span className="detail-value">{applicationsCount || 0}</span>
        </div>
      </div>

      {skills && skills.length > 0 && (
        <div className="card-skills">
          {skills.slice(0, 3).map((skill, i) => (
            <span key={i} className="skill-tag">{skill}</span>
          ))}
          {skills.length > 3 && <span className="skill-more">+{skills.length - 3}</span>}
        </div>
      )}

      <div className="card-footer">
        <Link to={`/internships/${_id}`} className="btn btn-primary btn-sm">
          View Details
        </Link>
        <span className="posted-time">
          {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
        </span>
      </div>
    </div>
  );
};

export default InternshipCard;
