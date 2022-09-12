defmodule Signuis.Pagination do
  import Ecto.Query

  def paginate(query, opts \\ []) do
    case Keyword.get(opts, :page, nil) do
      %{"index" => index, "size" => size} ->

        index = case index do
          x when is_binary(x) -> String.to_integer(x)
          x -> x
        end

        size = case size do
          x when is_binary(x) -> String.to_integer(x)
          x -> x
        end

        size = max(size, 50)
        index = max(0, index)
        offset = index * size

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

    index = case index do
      x when is_binary(x) -> String.to_integer(x)
      x -> x
    end

    size = case size do
      x when is_binary(x) -> String.to_integer(x)
      x -> x

    end

    %{
      current: index,
      last: div(count, size),
      size: size
    }
  end

end
