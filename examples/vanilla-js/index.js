let key = document.getElementById('sdkkey').value;

document.getElementById('sdkkey').addEventListener('change', e => {
  key = e.target.value;
});

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

document.getElementById(`placeorder-1`).addEventListener('click', () => {
  console.log('KEY', key);
  const flam = new FlamSaasSDK.init({
    environment: 'SANDBOX',
    key: key
  });

  let orderDetails = {
    productId: '96f0d15e-63cd-485b-8f37-bb474d287129',
    refId: uuidv4(),
    photo: 'https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg',
    video:
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    animation: 'CONFETTI',
    prefill: {
      name: 'John Doe Prints',
      email: 'support@email.com',
      phone: '+91 98765 43210'
    },
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/2048px-Facebook_f_logo_%282019%29.svg.png'
  };

  flam.placeOrder(orderDetails, (err, res) => {
    if (err) {
      console.log('ERR at client side', err);
    } else {
      console.log('RESSS', res);
    }
  });
});

document.getElementById(`placeorder-2`).addEventListener('click', () => {
  const flam = new FlamSaasSDK.init({
    environment: 'SANDBOX',
    key: key
  });

  let orderDetails = {
    productId: '96f0d15e-63cd-485b-8f37-bb474d287129',
    refId: uuidv4(),
    animation: 'CONFETTI',
    prefill: {
      name: 'John Doe Prints',
      email: 'support@email.com',
      phone: '+91 98765 43210'
    },
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/2048px-Facebook_f_logo_%282019%29.svg.png',
    theme: {
      color: '#32a852'
    }
  };

  flam.placeOrder(orderDetails, (err, res) => {
    if (err) {
      console.log('ERR at client side', err);
    } else {
      console.log('RESSS', res);
    }
  });
});
