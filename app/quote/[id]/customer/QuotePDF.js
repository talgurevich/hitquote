'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (elementId, fileName) => {
  try {
    // Try to get the full quote container first, otherwise fall back to content only
    let element = document.querySelector('.quote-container');
    
    // If no quote container, try to get just the content
    if (!element) {
      element = document.getElementById(elementId);
    }
    
    if (!element) {
      console.error('No element found for PDF generation');
      return false;
    }

    // Clone the element for PDF generation
    const clonedElement = element.cloneNode(true);
    
    // Remove any buttons from the clone
    const buttons = clonedElement.querySelectorAll('button');
    buttons.forEach(btn => {
      if (btn.parentElement) {
        btn.parentElement.removeChild(btn);
      }
    });
    
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '0';
    container.style.width = '800px';
    container.style.background = 'white';
    container.appendChild(clonedElement);
    document.body.appendChild(container);

    // Ensure all images in the cloned element have loaded
    const images = clonedElement.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
          img.onerror = resolve; // Resolve even on error to not block
          // Force reload if src exists
          if (img.src) {
            const src = img.src;
            img.src = '';
            img.src = src;
          }
        }
      });
    });
    
    // Wait for all images to load
    await Promise.all(imagePromises);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use html2canvas to capture the element
    const canvas = await html2canvas(clonedElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true, // Enable logging for debugging
      width: 800,
      windowWidth: 800,
      imageTimeout: 15000,
      onclone: (clonedDoc, element) => {
        // Ensure the cloned element is visible
        element.style.display = 'block';
        element.style.position = 'relative';
      }
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Convert to PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate the number of pages needed
    const ratio = pdfWidth / (imgWidth * 0.264583); // Convert pixels to mm
    const scaledWidth = pdfWidth;
    const scaledHeight = (imgHeight * 0.264583) * ratio;
    
    let position = 0;
    let heightLeft = scaledHeight;
    
    // Add the first page
    pdf.addImage(imgData, 'PNG', 0, position, scaledWidth, scaledHeight);
    heightLeft -= pdfHeight;
    
    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - scaledHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, scaledWidth, scaledHeight);
      heightLeft -= pdfHeight;
    }
    
    // Save the PDF
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

export const QuotePDFDownloadButton = ({ proposal }) => {
  const handleDownload = async (event) => {
    const fileName = `quote_${proposal?.proposal_number || proposal?.id?.slice(0,8) || 'document'}.pdf`;
    
    // Show loading state
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ מכין PDF...';
    btn.disabled = true;
    
    // Generate PDF
    const success = await generatePDF('quote-content', fileName);
    
    // Restore button state
    btn.innerHTML = originalText;
    btn.disabled = false;
    
    if (!success) {
      alert('שגיאה ביצירת PDF. אנא נסה שוב.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      style={{
        background: '#dc3545',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#c82333';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#dc3545';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
      }}
    >
      📄 הורד PDF
    </button>
  );
};