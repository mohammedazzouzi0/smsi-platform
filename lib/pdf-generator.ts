// PDF certificate generator using jsPDF
import jsPDF from "jspdf"

export interface CertificateData {
  userName: string
  userEmail: string
  moduleName: string
  score: number
  completionDate: Date
  certificateId: string
}

export class CertificateGenerator {
  private static addBackground(doc: jsPDF): void {
    // Add subtle background pattern
    doc.setFillColor(248, 250, 252) // Very light blue-gray
    doc.rect(0, 0, 210, 297, "F") // A4 size background

    // Add border
    doc.setDrawColor(59, 130, 246) // Blue border
    doc.setLineWidth(2)
    doc.rect(10, 10, 190, 277)

    // Add inner border
    doc.setDrawColor(147, 197, 253) // Light blue
    doc.setLineWidth(0.5)
    doc.rect(15, 15, 180, 267)
  }

  private static addHeader(doc: jsPDF): void {
    // Add logo area (placeholder)
    doc.setFillColor(59, 130, 246)
    doc.circle(105, 40, 15, "F")

    // Add shield icon representation
    doc.setFillColor(255, 255, 255)
    doc.setFontSize(20)
    doc.text("🛡", 100, 45)

    // Add company name
    doc.setTextColor(31, 41, 55) // Dark gray
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("SMSI Platform", 105, 65, { align: "center" })

    // Add subtitle
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(107, 114, 128) // Gray
    doc.text("Cybersecurity Awareness Training", 105, 75, { align: "center" })
  }

  private static addCertificateTitle(doc: jsPDF): void {
    // Certificate title
    doc.setFontSize(36)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(59, 130, 246) // Blue
    doc.text("CERTIFICATE", 105, 100, { align: "center" })

    doc.setFontSize(18)
    doc.setTextColor(31, 41, 55)
    doc.text("OF COMPLETION", 105, 115, { align: "center" })

    // Decorative line
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(1)
    doc.line(60, 125, 150, 125)
  }

  private static addCertificateContent(doc: jsPDF, data: CertificateData): void {
    const { userName, moduleName, score, completionDate } = data

    // "This is to certify that" text
    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(31, 41, 55)
    doc.text("This is to certify that", 105, 145, { align: "center" })

    // User name
    doc.setFontSize(28)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(59, 130, 246)
    doc.text(userName, 105, 165, { align: "center" })

    // Achievement text
    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(31, 41, 55)
    doc.text("has successfully completed the cybersecurity training module", 105, 185, { align: "center" })

    // Module name
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(16, 185, 129) // Green
    doc.text(`"${moduleName}"`, 105, 205, { align: "center" })

    // Score and date
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(31, 41, 55)
    doc.text(`with a score of ${score.toFixed(1)}% on ${completionDate.toLocaleDateString()}`, 105, 225, {
      align: "center",
    })

    // Compliance statement
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text("This training is compliant with ISO 27001, ISO 27002, ISO 27005, and RGPD regulations", 105, 240, {
      align: "center",
    })
  }

  private static addSignatureArea(doc: jsPDF, data: CertificateData): void {
    // Signature line
    doc.setDrawColor(107, 114, 128)
    doc.setLineWidth(0.5)
    doc.line(130, 260, 180, 260)

    // Signature label
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text("Authorized Signature", 155, 270, { align: "center" })

    // Date
    doc.text(`Date: ${data.completionDate.toLocaleDateString()}`, 30, 270)

    // Certificate ID
    doc.setFontSize(8)
    doc.text(`Certificate ID: ${data.certificateId}`, 30, 280)
  }

  private static addFooter(doc: jsPDF): void {
    // Footer text
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text("This certificate verifies completion of cybersecurity awareness training", 105, 290, { align: "center" })
    doc.text("and demonstrates commitment to information security best practices.", 105, 295, { align: "center" })
  }

  public static generateCertificate(data: CertificateData): jsPDF {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Build certificate
    this.addBackground(doc)
    this.addHeader(doc)
    this.addCertificateTitle(doc)
    this.addCertificateContent(doc, data)
    this.addSignatureArea(doc, data)
    this.addFooter(doc)

    return doc
  }

  public static generateCertificateId(userId: number, moduleId: number, timestamp: Date): string {
    // Generate unique certificate ID
    const year = timestamp.getFullYear()
    const month = String(timestamp.getMonth() + 1).padStart(2, "0")
    const day = String(timestamp.getDate()).padStart(2, "0")
    const userPart = String(userId).padStart(4, "0")
    const modulePart = String(moduleId).padStart(2, "0")
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()

    return `SMSI-${year}${month}${day}-${userPart}-${modulePart}-${randomPart}`
  }
}
