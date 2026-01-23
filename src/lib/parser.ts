import { parse } from 'node-html-parser';

const DRUPAL_DOMAIN = process.env.NEXT_PUBLIC_DRUPAL_DOMAIN || '';

export function parseQuickLinks(html: string) {
  const root = parse(html);
  const links = root.querySelectorAll('li a');
  return links.map(link => ({
    title: link.textContent.trim(),
    href: link.getAttribute('href') || '#',
  }));
}

export function parseCompanyMarquee(html: string) {
  const root = parse(html);
  return root.querySelectorAll('li').map(li => li.textContent.trim());
}

export function parsePlacementTable(html: string) {
  const root = parse(html);
  const rows = root.querySelectorAll('tr').slice(1); // Skip header row

  return rows.map(row => {
    const cells = row.querySelectorAll('td');
    const imgTag = cells[6]?.querySelector('img');
    let imgUrl = imgTag?.getAttribute('src') || '';
    
    // Resolve relative Drupal paths to absolute URLs
    if (imgUrl && !imgUrl.startsWith('http')) {
      imgUrl = `${DRUPAL_DOMAIN}${imgUrl}`;
    }

    return {
      name: cells[0]?.textContent.trim() || '',
      package: cells[1]?.textContent.trim() || '',
      company: cells[2]?.textContent.trim() || '',
      desc: cells[3]?.textContent.trim() || '',
      dept: cells[4]?.textContent.trim() || '',
      badge: cells[5]?.textContent.trim() || '',
      image: imgUrl,
    };
  });
}

export function parseDepartmentEditor(html: string) {
  const root = parse(html);
  const sections: { vision: string; mission: string; programs: string } = {
    vision: '',
    mission: '',
    programs: ''
  };

  const headers = root.querySelectorAll('h1, h2');
  
  headers.forEach((header, index) => {
    const title = header.textContent.trim().toLowerCase();
    let content = '';
    let next = header.nextElementSibling;

    // Collect all siblings until the next header
    while (next && !['H1', 'H2'].includes(next.tagName)) {
      content += next.outerHTML;
      next = next.nextElementSibling;
    }

    if (title.includes('vision')) sections.vision = content;
    else if (title.includes('mission')) sections.mission = content;
    else if (title.includes('programs')) sections.programs = content;
  });

  return sections;
}