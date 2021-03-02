export const text = (message: string) => {
  return {
    contents: [
      {
        type: 'text',
        text: message,
      },
    ],
  };
};

export const image = (url: string) => {
  return {
    contents: [
      {
        type: 'image',
        image: {
          url,
        },
      },
    ],
  };
};
