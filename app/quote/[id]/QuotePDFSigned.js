'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateSignedPDF = async (proposal) => {
  try {
    console.log('Generating signed PDF with proposal:', proposal);
    console.log('Signature data present:', !!proposal.signature_data);
    console.log('Signature status:', proposal.signature_status);
    
    // Find the quote container
    const quoteContainer = document.querySelector('.quote-container');
    
    if (!quoteContainer) {
      console.error('Quote container not found');
      alert('לא ניתן למצוא את הצעת המחיר');
      return false;
    }

    // Create a clean clone without interactive elements
    const clonedContainer = quoteContainer.cloneNode(true);
    
    // Remove ALL buttons and links from the clone
    const buttonsAndLinks = clonedContainer.querySelectorAll('button, a[href]');
    buttonsAndLinks.forEach(element => {
      element.remove();
    });
    
    // Remove the PDF download section entirely
    const pdfSections = clonedContainer.querySelectorAll('div');
    pdfSections.forEach(div => {
      if (div.textContent.includes('הורד PDF') || div.innerHTML.includes('📄')) {
        div.remove();
      }
    });
    
    // Remove mobile-buttons container
    const mobileButtons = clonedContainer.querySelector('.mobile-buttons');
    if (mobileButtons) {
      mobileButtons.remove();
    }
    
    // Convert blue colors to black/dark gray for professional PDF
    const elementsToRecolor = clonedContainer.querySelectorAll('*');
    elementsToRecolor.forEach(element => {
      if (element.style) {
        // Keep yellow color in PDF - don't convert it
        if (element.style.background && (element.style.background.includes('rgb(1, 112, 185)') || element.style.background.includes('025a8a'))) {
          element.style.background = '#3a3a3a';
        }
        
        if (element.style.backgroundColor && element.style.backgroundColor.includes('rgb(1, 112, 185)')) {
          element.style.backgroundColor = '#3a3a3a';
        }
        
        if (element.style.color && element.style.color.includes('rgb(1, 112, 185)')) {
          element.style.color = '#000000';
        }
        
        if (element.style.borderColor && element.style.borderColor.includes('rgb(1, 112, 185)')) {
          element.style.borderColor = '#3a3a3a';
        }
      }
    });
    
    // Keep the header in original yellow color but fix text contrast
    const header = clonedContainer.querySelector('.mobile-header');
    if (header) {
      header.style.color = 'black';
      const headerTexts = header.querySelectorAll('*');
      headerTexts.forEach(el => {
        if (el.style) el.style.color = 'black';
      });
    }
    
    // Fix table headers
    const tableHeaders = clonedContainer.querySelectorAll('tr');
    tableHeaders.forEach(tr => {
      if (tr.style.background && tr.style.background.includes('0170B9')) {
        tr.style.background = '#3a3a3a';
      }
    });
    
    // Fix total sections
    const totalSections = clonedContainer.querySelectorAll('.mobile-totals, .total-final');
    totalSections.forEach(section => {
      if (section.style.background && section.style.background.includes('0170B9')) {
        section.style.background = '#3a3a3a';
        section.style.backgroundImage = 'none';
      }
    });
    
    // Add signature section at the bottom if document is signed
    if (proposal.signature_data && proposal.signature_status === 'signed') {
      const signatureSection = document.createElement('div');
      signatureSection.style.cssText = `
        margin-top: 40px;
        padding: 30px;
        border: 2px solid #e9ecef;
        background: #f8f9fa;
        border-radius: 10px;
        page-break-inside: avoid;
      `;
      
      const signatureHTML = `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; color: #333; margin-bottom: 15px; text-align: center; border-bottom: 2px solid #ffdc33; padding-bottom: 10px;">
            אישור וחתימה דיגיטלית
          </h3>
        </div>
        <div style="display: flex; gap: 40px; align-items: flex-start;">
          <div style="flex: 1;">
            <div style="margin-bottom: 12px; font-size: 14px;">
              <strong style="color: #555;">נחתם על ידי:</strong> 
              <span style="color: #333; font-size: 16px;">${proposal.signer_name || 'לא צוין'}</span>
            </div>
            <div style="margin-bottom: 12px; font-size: 14px;">
              <strong style="color: #555;">תאריך חתימה:</strong> 
              <span style="color: #333;">${new Date(proposal.signature_timestamp).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div style="margin-bottom: 12px; font-size: 14px;">
              <strong style="color: #555;">שעת חתימה:</strong> 
              <span style="color: #333;">${new Date(proposal.signature_timestamp).toLocaleTimeString('he-IL')}</span>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: white; border: 2px solid #28a745; border-radius: 8px;">
              <div style="font-size: 13px; color: #28a745; font-weight: bold; margin-bottom: 10px;">
                ✓ מסמך זה נחתם דיגיטלית
              </div>
              <div style="font-size: 12px; color: #666; line-height: 1.5;">
                החתימה הדיגיטלית מהווה אישור מחייב להזמנה בהתאם לתנאים המפורטים בהצעת המחיר
              </div>
            </div>
          </div>
          <div style="flex: 0 0 auto;">
            <div style="border: 2px solid #333; padding: 15px; background: white; border-radius: 8px; min-width: 250px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 10px; text-align: center;">חתימה:</div>
              <img src="${proposal.signature_data}" style="width: 250px; height: 100px; object-fit: contain;" alt="חתימה" />
            </div>
          </div>
        </div>
      `;
      
      signatureSection.innerHTML = signatureHTML;
      clonedContainer.appendChild(signatureSection);
    }
    
    // Create a temporary container for the cleaned clone
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '0';
    tempContainer.style.width = '800px';
    tempContainer.style.background = 'white';
    tempContainer.appendChild(clonedContainer);
    document.body.appendChild(tempContainer);

    // Configure html2canvas options
    const options = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      letterRendering: true,
      foreignObjectRendering: false
    };

    // Wait for images and content to load
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Capture the cleaned clone
    const canvas = await html2canvas(clonedContainer, options);
    
    // Remove the temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.9;
    
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;
    const x = (pdfWidth - scaledWidth) / 2;
    const y = 10;

    // Check if we need multiple pages
    if (scaledHeight > pdfHeight - 20) {
      // Multi-page PDF
      let position = 0;
      let pageHeight = imgHeight * pdfWidth / imgWidth;
      let heightLeft = pageHeight;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight);
        heightLeft -= pdfHeight;
      }
    } else {
      // Single page PDF
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
    }
    
    // Generate filename
    const proposalNumber = proposal.proposal_number || 'quote';
    const fileName = `signed_quote_${proposalNumber}.pdf`;
    
    // Save the PDF
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating signed PDF:', error);
    alert('שגיאה ביצירת PDF חתום: ' + error.message);
    return false;
  }
};

export const SignedPDFButton = ({ proposal }) => {
  const handleClick = async (e) => {
    const btn = e.currentTarget;
    const originalText = btn.textContent;
    
    try {
      btn.textContent = '⏳ מכין PDF חתום...';
      btn.disabled = true;
      
      await generateSignedPDF(proposal);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  };

  if (proposal?.signature_status !== 'signed') {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      style={{
        background: '#546a7b',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '10px',
        border: 'none',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(84, 106, 123, 0.3)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#62929e';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(84, 106, 123, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#546a7b';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(84, 106, 123, 0.3)';
      }}
    >
      ✍️ הורד PDF חתום
    </button>
  );
};