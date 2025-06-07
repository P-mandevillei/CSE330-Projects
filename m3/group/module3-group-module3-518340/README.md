# CSE330
P-mandevillei

# Creative Portion:

1. Users can reply to comments and other replies. \
   Replies can also be edited and deleted.\
   Replies are managed in the table `secondary_comments`.
   <br><br>
2. When signed in, users can follow and unfollow other users by searching their usernames using the "see profile" button on homepage.\
   If two users are mutuals, they can view each other's profiles.\
   A `follows` table manages follows relation.
   <br><br>
3. Rich text input field is implemented using [TinyMCE API](https://www.tiny.cloud).\
   Users can post styled paragraphs and images.\
   Output is cleaned by [htmlpurifier](http://htmlpurifier.org/).\
   **Note:** Although the API key is exposed, `TinyMCE` restricts access by allowing only registered domains (my website) to make requests.\
   **Note 2:** My free trial ends on 2/20. The input behavior may change due to logistics issues (TinyMCE requiring my payment method), which I will do my best to monitor.\
   **Note 3:** Since I'm using MEDIUMBLOB to store the content, the images cannot exceed 16 MB.
   <br><br>
5. Posts are ordered by number of views; comments and replies are ordered by time they were posted/edited.\
   A `views` field and a `post_time` field are maintained in database.



<br><br>
[back](../../README.md)