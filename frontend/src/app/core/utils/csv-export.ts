// יוצר קובץ CSV תקין ומשמש את כל מסכי הדוחות במקום קוד כפול
export function exportCsvFile(fileName:string,rows:(string|number)[][]){
  const csv="\uFEFF"+rows.map(row=>row.map(cell=>`"${String(cell).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const link=document.createElement("a");
  link.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
  link.download=fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}
