defmodule Signuis.Pagination do
  import Ecto.Query

  def paginate(query, opts \\ []) do
    case Keyword.get(opts, :page, nil) do
      %{"index" => index, "size" => size} ->
        size = max(size, 50)
        index = max(0, index)
        offset = String.to_integer(index) * String.to_integer(size)

        query
        |> limit(^size)
        |> offset(^offset)

      _ -> query
    end
  end

  def get_pagination(count, opts) do
    %{"index" => index, "size" => size} = case Keyword.get(opts, :page, nil) do
      %{"index" => index, "size" => size} = page -> page
      _ -> %{"index" => 0, "size" => 50}
    end

    %{
      current: String.to_integer(index),
      last: div(count, String.to_integer(size)) + (if rem(count, String.to_integer(size)) > 0, do: 1, else: 0),
      size: String.to_integer(size)
    }
  end

end
