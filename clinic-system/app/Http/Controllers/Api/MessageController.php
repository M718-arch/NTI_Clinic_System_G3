<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    /**
     * Get all conversations for the authenticated user
     */
    public function conversations(Request $request)
    {
        try {
            $user = $request->user();
            
            $conversations = Conversation::where('user1_id', $user->id)
                ->orWhere('user2_id', $user->id)
                ->with(['user1', 'user2'])
                ->get()
                ->map(function($conversation) use ($user) {
                    $otherUser = $conversation->user1_id === $user->id 
                        ? $conversation->user2 
                        : $conversation->user1;
                    
                    $lastMessage = Message::where('conversation_id', $conversation->id)
                        ->latest()
                        ->first();
                    
                    // Get the other user's avatar/image URL
                    $avatarUrl = $this->getUserAvatarUrl($otherUser);
                    
                    return [
                        'id' => $conversation->id,
                        'other_user' => [
                            'id' => $otherUser->id,
                            'name' => $otherUser->name,
                            'email' => $otherUser->email,
                            'avatar' => $avatarUrl,
                            'image_url' => $avatarUrl,
                            'role' => $otherUser->role,
                        ],
                        'last_message' => $lastMessage ? $lastMessage->content : null,
                        'last_message_time' => $lastMessage ? $lastMessage->created_at : null,
                        'unread_count' => Message::where('conversation_id', $conversation->id)
                            ->where('receiver_id', $user->id)
                            ->where('is_read', false)
                            ->count(),
                    ];
                })
                ->filter(function($conversation) {
                    return $conversation['other_user'] !== null;
                })
                ->sortByDesc('last_message_time')
                ->values();

            return response()->json($conversations);

        } catch (\Exception $e) {
            \Log::error('Conversations error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching conversations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get messages for a specific conversation
     */
    public function messages(Request $request, $conversationId)
    {
        try {
            $user = $request->user();
            
            $conversation = Conversation::findOrFail($conversationId);
            
            // Check if user is part of conversation
            if ($conversation->user1_id !== $user->id && $conversation->user2_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $messages = Message::where('conversation_id', $conversationId)
                ->with(['sender', 'receiver'])
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function($message) use ($user) {
                    // Get sender avatar URL
                    $senderAvatar = $this->getUserAvatarUrl($message->sender);
                    
                    return [
                        'id' => $message->id,
                        'content' => $message->content,
                        'sender_id' => $message->sender_id,
                        'receiver_id' => $message->receiver_id,
                        'created_at' => $message->created_at,
                        'is_read' => $message->is_read,
                        'sender_name' => $message->sender->name ?? 'Unknown',
                        'sender_avatar' => $senderAvatar,
                        'is_mine' => $message->sender_id === $user->id,
                    ];
                });

            return response()->json($messages);

        } catch (\Exception $e) {
            \Log::error('Messages fetch error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send a new message
     */
    public function send(Request $request)
    {
        try {
            $request->validate([
                'receiver_id' => 'required|exists:users,id',
                'content' => 'required|string|max:1000',
                'conversation_id' => 'nullable|exists:conversations,id',
            ]);

            $user = $request->user();
            
            // Find or create conversation
            $conversation = null;
            
            if ($request->conversation_id) {
                $conversation = Conversation::find($request->conversation_id);
            }
            
            if (!$conversation) {
                $conversation = Conversation::where(function($query) use ($user, $request) {
                    $query->where('user1_id', $user->id)
                        ->where('user2_id', $request->receiver_id);
                })->orWhere(function($query) use ($user, $request) {
                    $query->where('user1_id', $request->receiver_id)
                        ->where('user2_id', $user->id);
                })->first();

                if (!$conversation) {
                    $conversation = Conversation::create([
                        'user1_id' => $user->id,
                        'user2_id' => $request->receiver_id,
                    ]);
                }
            }

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'receiver_id' => $request->receiver_id,
                'content' => $request->content,
                'is_read' => false,
            ]);

            // Load sender and receiver relationships
            $message->load(['sender', 'receiver']);

            // Add avatar to response
            $messageData = $message->toArray();
            $messageData['sender_avatar'] = $this->getUserAvatarUrl($message->sender);
            $messageData['receiver_avatar'] = $this->getUserAvatarUrl($message->receiver);

            return response()->json([
                'message' => 'Message sent successfully',
                'data' => $messageData
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Send message error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error sending message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all messages in a conversation as read
     */
    public function markAsRead(Request $request, $conversationId)
    {
        try {
            $user = $request->user();
            
            $conversation = Conversation::findOrFail($conversationId);
            
            // Check if user is part of conversation
            if ($conversation->user1_id !== $user->id && $conversation->user2_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $updated = Message::where('conversation_id', $conversationId)
                ->where('receiver_id', $user->id)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return response()->json([
                'message' => 'Messages marked as read',
                'updated_count' => $updated
            ]);

        } catch (\Exception $e) {
            \Log::error('Mark as read error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error marking messages as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
 * Helper method to get user avatar URL
 */
private function getUserAvatarUrl($user)
{
    if (!$user) {
        return null;
    }

    $appUrl = config('app.url');
    
    // Fix localhost URL without port
    if (str_contains($appUrl, 'localhost') && !str_contains($appUrl, ':')) {
        $appUrl = 'http://localhost:8000';
    }
    
    if (!str_ends_with($appUrl, '/')) {
        $appUrl .= '/';
    }

    // First check if user is a doctor
    $doctor = Doctor::where('user_id', $user->id)->first();
    if ($doctor && $doctor->image) {
        return $appUrl . 'storage/' . $doctor->image;
    }

    // Then check if user is a patient
    $patient = Patient::where('user_id', $user->id)->first();
if ($patient && $patient->photo) {
    return $appUrl . 'storage/' . $patient->photo;
}

    // Check for direct user avatar field
    if ($user->avatar) {
        if (filter_var($user->avatar, FILTER_VALIDATE_URL)) {
            return $user->avatar;
        }
        return $appUrl . 'storage/' . $user->avatar;
    }

    // Generate a default avatar using UI Avatars
    return 'https://ui-avatars.com/api/?name=' . urlencode($user->name) . '&background=random&size=128&bold=true';
}
}