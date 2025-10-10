import Image from '@tiptap/extension-image';

const UpdatedImage = Image.extend({
  name: 'image',
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('src'),
        renderHTML: (attributes: any) => ({ src: attributes.src }),
      },
      alt: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('alt'),
        renderHTML: (attributes: any) => ({ alt: attributes.alt }),
      },
      title: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('title'),
        renderHTML: (attributes: any) => ({ title: attributes.title }),
      },
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('width'),
        renderHTML: (attributes: any) => ({ width: attributes.width }),
      },
      height: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('height'),
        renderHTML: (attributes: any) => ({ height: attributes.height }),
      },
    };
  },
});

export default UpdatedImage;
