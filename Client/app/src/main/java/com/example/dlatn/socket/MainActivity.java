package com.example.dlatn.socket;
// AndroidManifest에서 <uses-permission android:name="android.permission.INTERNET"/>을 입력해야 됨
import android.os.Handler;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;
import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;

import org.json.JSONObject;

import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;


public class MainActivity extends AppCompatActivity {
    public String my_id="aaa"; // aaa: device bbb:AVL
    public String opp_id="bbb"; // AVL
    Button send;
    Button backButton;
    Button loadButton;
    TextView opp_textView;
    EditText editText;
    ListView listView;
    ChatAdapter adapter=new ChatAdapter();
    Handler handler = new Handler();
    private com.github.nkzawa.socketio.client.Socket mSocket;
    {
        try {
            mSocket = IO.socket("http://13.209.43.170:3000");
            mSocket.emit("socket_id",my_id);
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mSocket.on("message", onNewMessage);
        mSocket.connect();
        send = (Button) findViewById(R.id.send);
        backButton=(Button)findViewById(R.id.back_button);
        loadButton=(Button)findViewById(R.id.load);
        opp_textView=(TextView) findViewById(R.id.opp_textView);
        editText = (EditText) findViewById(R.id.editText);
        listView=(ListView)findViewById(R.id.listView);
        listView.setAdapter(adapter);
        opp_textView.setText(opp_id);

        loadButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                JSONObject object=new JSONObject();
                try{
                    object.accumulate("my_id",my_id);
                    object.accumulate("opp_id",opp_id);
                    mSocket.emit("loadChat",object);
                }catch(Exception e){}
            }
        });
        send.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String message = editText.getText().toString().trim();
                editText.setText("");
                JSONObject object=new JSONObject();
                try{
                    object.accumulate("sender_id",my_id);
                    object.accumulate("listener_id", opp_id);
                    object.accumulate("message",message);
                    mSocket.emit("message", object);
                }catch(Exception e){}
                editText.callOnClick();
            }
        });

        editText.setOnKeyListener(new View.OnKeyListener() {
            @Override
            public boolean onKey(View v, int keyCode, KeyEvent event) {
                //Enter key Action
                if ((event.getAction() == KeyEvent.ACTION_DOWN) && (keyCode == KeyEvent.KEYCODE_ENTER)) {
                    send.callOnClick();
                    return true;
                }
                return false;
            }
        });
        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                onBackPressed();
            }
        });
    }

    private Emitter.Listener onNewMessage = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    JSONObject data = (JSONObject) args[0];
                    String name="";
                    String message="";
                    try {
                        message = data.getString("message");
                        name=data.getString("name");
                    }catch(Exception e){}
                    final String n=name;
                    final String m=message;
                    handler.post(new Runnable() {
                        @Override
                        public void run() {
                            adapter.addItem(new ChatItem(n, m));
                            listView.setAdapter(adapter);
                        }
                    });
                }
            });
        }
    };
    class ChatAdapter extends BaseAdapter{
        ArrayList<ChatItem> items=new ArrayList<ChatItem>();
        public void addItem(ChatItem item){
            items.add(item);
        }
        @Override
        public int getCount() {
            return items.size();
        }

        @Override
        public Object getItem(int position) {
            return items.get(position);
        }

        @Override
        public long getItemId(int position) {
            return position;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            ChatItemView view=new ChatItemView(getApplicationContext());
            ChatItem item=items.get(position);
            view.setSender(item.getSender());
            view.setMessage(item.getMessage());
            return view;
        }
    }
}
