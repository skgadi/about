export interface GSK_SC_NOTIFICATION {
  id: 'GSK_SC_NOTIFICATION';
  payload: {
    message: string;
    caption?: string;
    timeout: number;
    icon?: string;
    position:
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right'
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'center';
    type: 'error' | 'success' | 'positive' | 'info' | 'warning' | 'negative' | 'primary' | 'accent';
  };
}
