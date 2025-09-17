'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateSimplePDF = async () => {
  try {
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
    
    // Convert blue colors to black/dark gray for professional PDF using Breadstation palette
    const elementsToRecolor = clonedContainer.querySelectorAll('*');
    elementsToRecolor.forEach(element => {
      // Remove inline styles that might override our changes
      if (element.style) {
        // Handle background colors and gradients
        if (element.style.background && (element.style.background.includes('#0170B9') || element.style.background.includes('rgb(1, 112, 185)') || element.style.background.includes('025a8a'))) {
          element.style.background = '#3a3a3a';
        }
        
        if (element.style.backgroundColor && (element.style.backgroundColor.includes('#0170B9') || element.style.backgroundColor.includes('rgb(1, 112, 185)'))) {
          element.style.backgroundColor = '#3a3a3a';
        }
        
        // Handle text colors
        if (element.style.color && (element.style.color.includes('#0170B9') || element.style.color.includes('rgb(1, 112, 185)'))) {
          element.style.color = '#000000';
        }
        
        // Handle border colors
        if (element.style.borderColor && (element.style.borderColor.includes('#0170B9') || element.style.borderColor.includes('rgb(1, 112, 185)'))) {
          element.style.borderColor = '#3a3a3a';
        }
      }
    });
    
    // Target specific elements by class/content for more precise control
    const header = clonedContainer.querySelector('.mobile-header');
    if (header) {
      header.style.background = '#3a3a3a';
      header.style.backgroundImage = 'none';
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

    // Wait longer for images (especially new logo) to load
    await new Promise(resolve => setTimeout(resolve, 1000));

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
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.9; // 90% to add margins
    
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
    const proposalElement = document.querySelector('[data-proposal-number]');
    const proposalNumber = proposalElement?.dataset?.proposalNumber || 
                          document.querySelector('p')?.textContent?.match(/מס׳ הצעה: (.+)/)?.[1] || 
                          'quote';
    const fileName = `quote_${proposalNumber}.pdf`;
    
    // Save the PDF
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('שגיאה ביצירת PDF: ' + error.message);
    return false;
  }
};

export const generatePDFBlob = async (proposal) => {
  try {
    // Find the quote container
    const quoteContainer = document.querySelector('.quote-container');
    
    if (!quoteContainer) {
      throw new Error('Quote container not found');
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
    
    // Convert blue colors to black/dark gray for professional PDF using Breadstation palette
    const elementsToRecolor = clonedContainer.querySelectorAll('*');
    elementsToRecolor.forEach(element => {
      // Remove inline styles that might override our changes
      if (element.style) {
        // Handle background colors and gradients
        if (element.style.background && (element.style.background.includes('#0170B9') || element.style.background.includes('rgb(1, 112, 185)') || element.style.background.includes('025a8a'))) {
          element.style.background = '#3a3a3a';
        }
        
        if (element.style.backgroundColor && (element.style.backgroundColor.includes('#0170B9') || element.style.backgroundColor.includes('rgb(1, 112, 185)'))) {
          element.style.backgroundColor = '#3a3a3a';
        }
        
        // Handle text colors
        if (element.style.color && (element.style.color.includes('#0170B9') || element.style.color.includes('rgb(1, 112, 185)'))) {
          element.style.color = '#000000';
        }
        
        // Handle border colors
        if (element.style.borderColor && (element.style.borderColor.includes('#0170B9') || element.style.borderColor.includes('rgb(1, 112, 185)'))) {
          element.style.borderColor = '#3a3a3a';
        }
      }
    });
    
    // Target specific elements by class/content for more precise control
    const header = clonedContainer.querySelector('.mobile-header');
    if (header) {
      header.style.background = '#3a3a3a';
      header.style.backgroundImage = 'none';
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

    // Wait longer for images (especially new logo) to load
    await new Promise(resolve => setTimeout(resolve, 1000));

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
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.9; // 90% to add margins
    
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
    
    // Return PDF as Blob
    return pdf.output('blob');
    
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw error;
  }
};

export const SimplePDFButton = ({ proposal }) => {
  const handleClick = async (e) => {
    const btn = e.currentTarget;
    const originalText = btn.textContent;
    
    try {
      btn.textContent = '⏳ מכין PDF...';
      btn.disabled = true;
      
      await generateSimplePDF();
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        background: '#dc3545',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      📄 הורד PDF
    </button>
  );
};