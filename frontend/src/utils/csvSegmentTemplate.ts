/** Template + helpers for CSV segment import */

export const COMMERCE_CONTACTS_TEMPLATE_FILENAME = 'commerce_contacts_template.csv';

export const COMMERCE_CONTACTS_TEMPLATE_CSV = `phone_number,full_name,email,state,city,age,gender,product_type,outstanding_amount,dpd_bucket,last_transaction_date,opt_in_whatsapp,opt_in_sms,custom_field_1,custom_field_2
9876543210,Rahul Sharma,rahul@email.com,Maharashtra,Mumbai,34,Male,Personal Loan,45000,30-60,2024-10-15,TRUE,TRUE,value1,value2
`;

export function downloadCommerceContactsTemplate(): void {
  const blob = new Blob([COMMERCE_CONTACTS_TEMPLATE_CSV], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = COMMERCE_CONTACTS_TEMPLATE_FILENAME;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCsvSimple(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const parseLine = (line: string) =>
    line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

export function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, '_');
}

export function isTruthyCell(v: string | undefined): boolean {
  if (v === undefined) return false;
  const s = v.trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'y';
}
