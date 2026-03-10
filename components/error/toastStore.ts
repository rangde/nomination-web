export type ToastType = 'error' | 'warning' | 'success';

export type ToastItem = {
  id: number;
  type: ToastType;
  hi: string;
  en?: string;
};

let listeners: ((msgs: ToastItem[]) => void)[] = [];
let messages: ToastItem[] = [];

let seq = 0;
function createId(): number {
  seq = (seq + 1) % 1000;
  return Date.now() * 1000 + seq;
}

export function subscribe(fn: (msgs: ToastItem[]) => void) {
  listeners.push(fn);
  fn(messages);

  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

function notify() {
  listeners.forEach((l) => l([...messages]));
}

export function removeToast(id: number) {
  messages = messages.filter((m) => m.id !== id);
  notify();
}

export function addToast(item: Omit<ToastItem, 'id'>) {
  const newItem: ToastItem = { ...item, id: createId() };

  messages = [...messages, newItem];
  notify();

  setTimeout(() => {
    removeToast(newItem.id);
  }, 3000);
}
