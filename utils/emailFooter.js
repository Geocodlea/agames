export const emailFooter = (token) =>
  `\n\n Ioana Mocanu \n Creative Board Gaming \n\n e: ioana.mocanu@cbgshop.ro \n t: 0736465213 \n w: www.cbgshop.ro / www.agames.ro \n f: www.facebook.com/CreativeBoardGaming \n\n If you no longer wish to receive emails from us, please unsubscribe, using this link: ${process.env.DEPLOYED_URL}/api/unsubscribe/${token} \n`;

export const emailFooterHtml = (token) => `<p>
  Ioana Mocanu<br>
  Creative Board Gaming<br><br>
  e: <a href="mailto:ioana.mocanu@cbgshop.ro">ioana.mocanu@cbgshop.ro</a><br>
  t: <a href="tel:0736465213">0736465213</a><br>
  w: <a href="http://www.cbgshop.ro">www.cbgshop.ro</a> / <a href="http://www.agames.ro">www.agames.ro</a><br>
  f: <a href="http://www.facebook.com/CreativeBoardGaming">www.facebook.com/CreativeBoardGaming</a>
</p>
<p>
  If you no longer wish to receive emails from us, please <a href="${process.env.DEPLOYED_URL}/api/unsubscribe/${token}" style="color: #999999; text-decoration: none;">unsubscribe</a>.
</p>`;
