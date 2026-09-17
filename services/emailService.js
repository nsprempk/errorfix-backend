import transporter from "../config/email.js";

const formatSolution = (solution) => {
  const solutions = {
    website: "Website",
    mobile: "Mobile App",
    desktop: "Desktop App",
    "website-mobile": "Website + Mobile App",
    "mobile-desktop": "Mobile App + Desktop App",
    complete: "Complete Solution",
  };

  return solutions[solution] || solution || "Custom Project";
};

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const sendQuoteEmails = async (quote) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  const clientName = escapeHtml(quote.name);
  const companyName = escapeHtml(quote.companyName);
  const email = escapeHtml(quote.email);
  const phone = escapeHtml(quote.phone);
  const country = escapeHtml(quote.country);
  const industry = escapeHtml(quote.industry);
  const solution = escapeHtml(formatSolution(quote.solution));

  const description = escapeHtml(quote.projectDescription);

  const existingWebsite = escapeHtml(quote.existingWebsite || "Not provided");

  const features =
    quote.features?.length > 0
      ? quote.features
          .map((feature) => `<li>${escapeHtml(feature)}</li>`)
          .join("")
      : "<li>None selected</li>";

  const platforms =
    quote.platforms?.length > 0
      ? quote.platforms
          .map((platform) => `<li>${escapeHtml(platform)}</li>`)
          .join("")
      : "<li>None selected</li>";

  /*
   * ADMIN EMAIL
   */

  const adminMail = {
    from: `"Errorfix Solution" <${process.env.SMTP_USER}>`,
    to: adminEmail,

    replyTo: quote.email,

    subject: `New Project Enquiry — ${quote.companyName}`,

    html: `
      <!DOCTYPE html>
      <html>
      <body style="
        margin:0;
        padding:0;
        background:#f4f4f5;
        font-family:Arial,Helvetica,sans-serif;
      ">

        <div style="
          max-width:680px;
          margin:40px auto;
          background:#ffffff;
          border-radius:16px;
          overflow:hidden;
          border:1px solid #e4e4e7;
        ">

          <div style="
            background:#09090b;
            color:#ffffff;
            padding:32px;
          ">
            <div style="
              font-size:12px;
              letter-spacing:2px;
              text-transform:uppercase;
              opacity:.65;
            ">
              Errorfix Solution
            </div>

            <h1 style="
              margin:10px 0 0;
              font-size:28px;
            ">
              New Project Enquiry
            </h1>
          </div>

          <div style="padding:32px;">

            <p style="
              color:#52525b;
              font-size:15px;
              line-height:1.7;
            ">
              A new project enquiry has been submitted
              through your website.
            </p>

            <h2 style="font-size:18px;">
              Client Details
            </h2>

            <table
              width="100%"
              cellpadding="10"
              cellspacing="0"
              style="
                border-collapse:collapse;
                font-size:14px;
              "
            >
              <tr>
                <td><strong>Name</strong></td>
                <td>${clientName}</td>
              </tr>

              <tr>
                <td><strong>Company</strong></td>
                <td>${companyName}</td>
              </tr>

              <tr>
                <td><strong>Email</strong></td>
                <td>${email}</td>
              </tr>

              <tr>
                <td><strong>Phone</strong></td>
                <td>${phone}</td>
              </tr>

              <tr>
                <td><strong>Country</strong></td>
                <td>${country}</td>
              </tr>

              <tr>
                <td><strong>Industry</strong></td>
                <td>${industry}</td>
              </tr>

              <tr>
                <td><strong>Solution</strong></td>
                <td>${solution}</td>
              </tr>
            </table>

            <h2 style="
              margin-top:32px;
              font-size:18px;
            ">
              Project Description
            </h2>

            <div style="
              padding:18px;
              background:#f4f4f5;
              border-radius:12px;
              color:#52525b;
              line-height:1.7;
              font-size:14px;
            ">
              ${description}
            </div>

            <h2 style="
              margin-top:32px;
              font-size:18px;
            ">
              Features
            </h2>

            <ul style="
              color:#52525b;
              line-height:1.8;
            ">
              ${features}
            </ul>

            <h2 style="
              margin-top:32px;
              font-size:18px;
            ">
              Platforms
            </h2>

            <ul style="
              color:#52525b;
              line-height:1.8;
            ">
              ${platforms}
            </ul>

            <h2 style="
              margin-top:32px;
              font-size:18px;
            ">
              Existing Website / App
            </h2>

            <p style="
              color:#52525b;
              font-size:14px;
            ">
              ${existingWebsite}
            </p>

          </div>

          <div style="
            padding:24px 32px;
            background:#fafafa;
            border-top:1px solid #e4e4e7;
            color:#71717a;
            font-size:12px;
          ">
            This enquiry was generated automatically
            from the Errorfix Solution website.
          </div>

        </div>

      </body>
      </html>
    `,
  };

  /*
   * CLIENT EMAIL
   */

  const clientMail = {
    from: `"Errorfix Solution" <${process.env.SMTP_USER}>`,

    to: quote.email,

    subject: "We received your project enquiry",

    html: `
      <!DOCTYPE html>
      <html>
      <body style="
        margin:0;
        padding:0;
        background:#f4f4f5;
        font-family:Arial,Helvetica,sans-serif;
      ">

        <div style="
          max-width:620px;
          margin:40px auto;
          background:#ffffff;
          border-radius:16px;
          overflow:hidden;
          border:1px solid #e4e4e7;
        ">

          <div style="
            background:#09090b;
            color:#ffffff;
            padding:32px;
          ">

            <div style="
              font-size:12px;
              letter-spacing:2px;
              text-transform:uppercase;
              opacity:.65;
            ">
              Errorfix Solution
            </div>

            <h1 style="
              margin:10px 0 0;
              font-size:28px;
            ">
              Thank You, ${clientName}
            </h1>

          </div>

          <div style="padding:32px;">

            <p style="
              font-size:15px;
              color:#52525b;
              line-height:1.7;
            ">
              We've received your project enquiry.
              Our team will review your requirements
              and contact you shortly.
            </p>

            <div style="
              margin-top:24px;
              padding:20px;
              background:#f4f4f5;
              border-radius:12px;
            ">

              <p style="margin:0 0 8px;">
                <strong>Company:</strong>
                ${companyName}
              </p>

              <p style="margin:0 0 8px;">
                <strong>Solution:</strong>
                ${solution}
              </p>

              <p style="margin:0;">
                <strong>Country:</strong>
                ${country}
              </p>

            </div>

            <p style="
              margin-top:28px;
              font-size:14px;
              color:#71717a;
              line-height:1.7;
            ">
              If you need to provide additional information,
              simply reply to this email.
            </p>

            <p style="
              margin-top:30px;
              font-weight:bold;
            ">
              Errorfix Solution
            </p>

          </div>

        </div>

      </body>
      </html>
    `,
  };

  /*
   * Send both emails.
   */

  await Promise.all([
    transporter.sendMail(adminMail),
    transporter.sendMail(clientMail),
  ]);
};
