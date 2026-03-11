const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { auth, isStudentOnly } = require('../middleware/auth');

// ─── FAANG Resume Keywords Database ───────────────────────────────────────
const FAANG_KEYWORDS = {
  technical: [
    'algorithms', 'data structures', 'system design', 'scalability', 'optimization',
    'performance', 'architecture', 'microservices', 'distributed systems', 'cloud',
    'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'agile', 'testing',
    'debugging', 'problem-solving', 'REST API', 'GraphQL', 'SQL', 'NoSQL'
  ],
  soft: [
    'leadership', 'collaboration', 'communication', 'cross-functional', 'mentoring',
    'stakeholder management', 'project management', 'analytical', 'strategic'
  ],
  impact: [
    'reduced', 'improved', 'increased', 'optimized', 'automated', 'implemented',
    'designed', 'architected', 'led', 'delivered', 'achieved', 'scaled'
  ]
};

// ─── Generate Resume PDF (Preview Style Only) ─────────────────────────────
const generateResumePDF = (user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 36, bottom: 36, left: 50, right: 50 }
      });
      
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const primaryColor = '#1E3A8A'; // Navy blue
      const accentColor = '#2563EB';  // Bright blue
      const textColor = '#1F2937';    // Dark gray
      const lightGray = '#6B7280';
      
      let yPos = 50;
      
      // ═══ HEADER SECTION ═══════════════════════════════════════════════
      doc.fontSize(24)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text(user.name.toUpperCase(), 50, yPos, { align: 'center' });
      
      yPos += 30;
      
      // Contact info - single line, centered
      const contactInfo = [
        user.email,
        user.phone || '',
        user.location || '',
        user.linkedIn ? 'LinkedIn' : '',
        user.github ? 'GitHub' : '',
        user.portfolio ? 'Portfolio' : ''
      ].filter(Boolean).join('  •  ');
      
      doc.fontSize(9)
         .fillColor(lightGray)
         .font('Helvetica')
         .text(contactInfo, 50, yPos, { align: 'center' });
      
      yPos += 25;
      
      // Divider line
      doc.moveTo(50, yPos).lineTo(562, yPos).strokeColor('#E5E7EB').stroke();
      yPos += 20;
      
      // ═══ SUMMARY / OBJECTIVE ══════════════════════════════════════════
      if (user.bio) {
        doc.fontSize(11)
           .fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text('PROFESSIONAL SUMMARY', 50, yPos);
        
        yPos += 15;
        
        doc.fontSize(10)
           .fillColor(textColor)
           .font('Helvetica')
           .text(user.bio, 50, yPos, { width: 512, align: 'justify', lineGap: 2 });
        
        yPos += doc.heightOfString(user.bio, { width: 512, lineGap: 2 }) + 15;
      }
      
      // ═══ EDUCATION ════════════════════════════════════════════════════
      if (user.education && user.education.length > 0) {
        doc.fontSize(11)
           .fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text('EDUCATION', 50, yPos);
        
        yPos += 12;
        
        user.education.forEach((edu, index) => {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }
          
          // Institution and degree on same line
          doc.fontSize(10)
             .fillColor(textColor)
             .font('Helvetica-Bold')
             .text(edu.institution || 'University', 50, yPos, { continued: true })
             .font('Helvetica')
             .text(` — ${edu.degree || 'Degree'} in ${edu.field || 'Field'}`, { width: 512 });
          
          yPos += 14;
          
          // Years (right-aligned on same line as institution)
          const yearText = `${edu.startYear || 'Start'} - ${edu.endYear || 'Present'}`;
          doc.fontSize(9)
             .fillColor(lightGray)
             .text(yearText, 50, yPos - 14, { align: 'right', width: 512 });
          
          yPos += 8;
        });
        
        yPos += 8;
      }
      
      // ═══ TECHNICAL SKILLS ═════════════════════════════════════════════
      if (user.skills && user.skills.length > 0) {
        if (yPos > 680) {
          doc.addPage();
          yPos = 50;
        }
        
        doc.fontSize(11)
           .fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text('TECHNICAL SKILLS', 50, yPos);
        
        yPos += 12;
        
        // Group skills by category (if they contain category keywords)
        const categories = {
          'Programming Languages': [],
          'Frameworks & Libraries': [],
          'Tools & Platforms': [],
          'Other': []
        };
        
        const langKeywords = ['javascript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'typescript', 'php', 'ruby', 'swift', 'kotlin'];
        const frameworkKeywords = ['react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel', '.net'];
        const toolKeywords = ['git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'mongodb', 'postgresql', 'mysql', 'redis'];
        
        user.skills.forEach(skill => {
          const lowerSkill = skill.toLowerCase();
          if (langKeywords.some(k => lowerSkill.includes(k))) {
            categories['Programming Languages'].push(skill);
          } else if (frameworkKeywords.some(k => lowerSkill.includes(k))) {
            categories['Frameworks & Libraries'].push(skill);
          } else if (toolKeywords.some(k => lowerSkill.includes(k))) {
            categories['Tools & Platforms'].push(skill);
          } else {
            categories['Other'].push(skill);
          }
        });
        
        // Display categorized skills
        Object.entries(categories).forEach(([category, skills]) => {
          if (skills.length > 0) {
            doc.fontSize(9.5)
               .fillColor(textColor)
               .font('Helvetica-Bold')
               .text(`${category}: `, 50, yPos, { continued: true })
               .font('Helvetica')
               .fillColor(textColor)
               .text(skills.join(', '), { width: 512 });
            
            yPos += doc.heightOfString(skills.join(', '), { width: 450 }) + 8;
          }
        });
        
        yPos += 8;
      }
      
      // ═══ EXPERIENCE ═══════════════════════════════════════════════════
      if (user.experience && user.experience.length > 0) {
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }
        
        doc.fontSize(11)
           .fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text('EXPERIENCE', 50, yPos);
        
        yPos += 12;
        
        user.experience.forEach((exp, index) => {
          if (yPos > 680) {
            doc.addPage();
            yPos = 50;
          }
          
          // Position and Company
          doc.fontSize(10)
             .fillColor(textColor)
             .font('Helvetica-Bold')
             .text(exp.position || 'Position', 50, yPos, { continued: true })
             .font('Helvetica')
             .text(` — ${exp.company || 'Company'}`, { width: 400 });
          
          // Duration (right-aligned)
          doc.fontSize(9)
             .fillColor(lightGray)
             .text(exp.duration || 'Duration', 50, yPos, { align: 'right', width: 512 });
          
          yPos += 14;
          
          // Description/achievements
          if (exp.description) {
            const achievements = exp.description.split('\n').filter(Boolean);
            achievements.forEach(achievement => {
              const bulletText = achievement.trim().startsWith('•') || achievement.trim().startsWith('-') 
                ? achievement.trim().substring(1).trim() 
                : achievement.trim();
              
              doc.fontSize(9.5)
                 .fillColor(textColor)
                 .font('Helvetica')
                 .text('•  ', 50, yPos, { continued: true })
                 .text(bulletText, { width: 502, lineGap: 1.5 });
              
              yPos += doc.heightOfString('•  ' + bulletText, { width: 502, lineGap: 1.5 }) + 4;
            });
          }
          
          yPos += 10;
        });
      }
      
      // ═══ FOOTER ═══════════════════════════════════════════════════════
      const footerY = 752; // Bottom of page
      doc.fontSize(7)
         .fillColor('#9CA3AF')
         .font('Helvetica')
         .text('Generated via InternHub Resume Builder', 50, footerY, { align: 'center', width: 512 });
      
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
};

// ─── API Routes ───────────────────────────────────────────────────────────

// @route   POST /api/resume/generate
// @desc    Generate resume PDF from user profile (preview style only)
// @access  Private (student only)
router.post('/generate', auth, isStudentOnly, async (req, res) => {
  try {
    const pdfBuffer = await generateResumePDF(req.user);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${req.user.name.replace(/\s+/g, '_')}_Resume.pdf"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Resume generation error:', error);
    res.status(500).json({ message: 'Failed to generate resume', error: error.message });
  }
});

// @route   POST /api/resume/analyze
// @desc    Analyze resume content for ATS optimization
// @access  Private (student only)
router.post('/analyze', auth, isStudentOnly, async (req, res) => {
  try {
    const user = req.user;
    const analysis = {
      score: 0,
      maxScore: 100,
      sections: {},
      suggestions: [],
      keywords: {
        found: [],
        missing: []
      }
    };
    
    let totalScore = 0;
    
    // Analyze contact info (10 points)
    const contactScore = [
      user.email, user.phone, user.location, user.linkedIn
    ].filter(Boolean).length * 2.5;
    analysis.sections.contact = { score: contactScore, max: 10 };
    totalScore += contactScore;
    
    if (contactScore < 10) {
      analysis.suggestions.push('Add missing contact details (phone, location, LinkedIn, GitHub)');
    }
    
    // Analyze summary (15 points)
    if (user.bio) {
      const summaryLength = user.bio.split(' ').length;
      const summaryScore = summaryLength >= 30 && summaryLength <= 100 ? 15 : summaryLength >= 15 ? 10 : 5;
      analysis.sections.summary = { score: summaryScore, max: 15 };
      totalScore += summaryScore;
      
      if (summaryScore < 15) {
        analysis.suggestions.push('Professional summary should be 30-100 words highlighting key achievements and skills');
      }
    } else {
      analysis.sections.summary = { score: 0, max: 15 };
      analysis.suggestions.push('Add a professional summary (3-4 sentences about your expertise and goals)');
    }
    
    // Analyze skills (25 points)
    if (user.skills && user.skills.length > 0) {
      const skillScore = Math.min(user.skills.length * 2, 25);
      analysis.sections.skills = { score: skillScore, max: 25 };
      totalScore += skillScore;
      
      // Check for FAANG keywords
      const userSkillsLower = user.skills.map(s => s.toLowerCase());
      FAANG_KEYWORDS.technical.forEach(keyword => {
        if (userSkillsLower.some(skill => skill.includes(keyword))) {
          analysis.keywords.found.push(keyword);
        } else {
          analysis.keywords.missing.push(keyword);
        }
      });
      
      if (skillScore < 20) {
        analysis.suggestions.push('Add more technical skills (aim for 10-15 relevant skills)');
      }
    } else {
      analysis.sections.skills = { score: 0, max: 25 };
      analysis.suggestions.push('Add technical skills section with relevant technologies');
    }
    
    // Analyze education (15 points)
    if (user.education && user.education.length > 0) {
      const eduScore = user.education.length * 7.5;
      analysis.sections.education = { score: Math.min(eduScore, 15), max: 15 };
      totalScore += Math.min(eduScore, 15);
    } else {
      analysis.sections.education = { score: 0, max: 15 };
      analysis.suggestions.push('Add education details (degree, institution, graduation year)');
    }
    
    // Analyze experience (35 points)
    if (user.experience && user.experience.length > 0) {
      let expScore = 0;
      user.experience.forEach(exp => {
        // Check for quantifiable achievements
        const hasMetrics = /\d+/.test(exp.description || '');
        const hasActionVerb = FAANG_KEYWORDS.impact.some(verb => 
          (exp.description || '').toLowerCase().includes(verb)
        );
        
        if (hasMetrics && hasActionVerb) expScore += 12;
        else if (hasMetrics || hasActionVerb) expScore += 8;
        else expScore += 4;
      });
      
      analysis.sections.experience = { score: Math.min(expScore, 35), max: 35 };
      totalScore += Math.min(expScore, 35);
      
      if (expScore < 25) {
        analysis.suggestions.push('Use action verbs (Led, Implemented, Optimized) and quantify achievements (increased by 30%, saved $10k)');
      }
    } else {
      analysis.sections.experience = { score: 0, max: 35 };
      analysis.suggestions.push('Add work experience or projects with measurable impact');
    }
    
    analysis.score = Math.round(totalScore);
    
    // Overall recommendations
    if (analysis.score >= 80) {
      analysis.level = 'Excellent - FAANG Ready';
    } else if (analysis.score >= 60) {
      analysis.level = 'Good - Needs Minor Improvements';
    } else if (analysis.score >= 40) {
      analysis.level = 'Fair - Needs Significant Work';
    } else {
      analysis.level = 'Poor - Major Revisions Needed';
    }
    
    res.json({ analysis });
    
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze resume', error: error.message });
  }
});

// @route   GET /api/resume/keywords
// @desc    Get FAANG-level keyword suggestions
// @access  Private (student only)
router.get('/keywords', auth, isStudentOnly, (req, res) => {
  res.json({ keywords: FAANG_KEYWORDS });
});

module.exports = router;
