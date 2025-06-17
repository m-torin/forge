export default async function downloadPhoto(url: string, filename: string) {
  if (!filename) {
    filename = url.split('\\').pop()?.split('/').pop() ?? '';
  }
  try {
    const response = await fetch(url, {
      headers: new Headers({
        Origin: location.origin,
      }),
      mode: 'cors',
    });
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    forceDownload(blobUrl, filename);
    return blob;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

function forceDownload(blobUrl: string, filename: string) {
  const a: any = document.createElement('a');
  a.download = filename;
  a.href = blobUrl;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
